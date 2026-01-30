# Informe Técnico — Simulador ElectroNova

Fecha: 2026-01-28
Versión del informe: 1.0

---

## Resumen ejecutivo

Este documento presenta un análisis técnico exhaustivo de la aplicación "Electronova Sim" basado en la especificación oficial ([Docs/EspecificacionesElectroNova.md]) y el código fuente presente en el repositorio. Cubre la arquitectura general, el backend (motor de rondas y mercado), el frontend (estructura, componentes y flujos), la integración (APIs y WebSocket), verificación frente a la especificación, discrepancias detectadas y recomendaciones operativas y de desarrollo.

Fuentes principales consultadas:
- Docs/EspecificacionesElectroNova.md
- README.md
- client/src (AppV2, main, context, pages, components, services)
- server/src (app.js, services/marketEngineV2.js, routes/decisionRoutes.js)

---

## 1. Alcance y objetivo

Objetivo: entregar un informe técnico en Markdown que documente y explique la lógica interna del simulador, facilite su mantenibilidad y sirva como base para correcciones y mejoras.

Alcance: revisión de arquitectura, descripciones de subsistemas, mapeo entre la especificación y la implementación, detección de discrepancias y lista de acciones recomendadas.

---

## 2. Visión global de la arquitectura

Arquitectura de alto nivel:

```
Frontend (React Vite, AppV2)  <---- HTTPS / WS ---->  Backend (Node/Express + Socket.IO)
                                               |
                                               --> MongoDB (persistencia)
                                               --> Redis (cache / sessions)
                                               --> Servicios: marketEngineV2, inventoryService, capacityService
Reverse proxy: nginx (SSL, static) - Deploy: docker/PM2
```

Responsabilidades principales:
- Frontend: UI, validaciones cliente, construcción y envío de decisiones, consumo de APIs y sockets.
- Backend: autenticación, validación authoritative de decisiones, procesamiento de rondas, motor de mercado, contabilidad, emisión de eventos en tiempo real.

---

## 3. Backend — estructura y lógica

### 3.1 Punto de entrada y middlewares
- Archivo principal: `server/src/app.js`.
- Middlewares de seguridad: helmet, compresión, CORS configurado por entorno, sanitización de inputs, rate limiters, logging y métricas.
- Socket.IO inicializado y adjuntado a la app (`io`) con rooms por `gameCode`.

### 3.2 Ciclo de procesamiento de ronda
Basado en la especificación y la implementación encontrada, el flujo es:
1. Asignación de capacidad por empresa (`totalProductionCapacity / empresas_activas`).
2. Procesamiento de llegadas (materia prima y PT en tránsito) — decremento de `roundsUntilArrival` y transferencia a inventarios.
3. Validación y ejecución de decisiones: procurement -> production -> logística (orden estricta).
4. Ejecución del motor de mercado por plaza y producto: asignación de demanda y ventas.
5. Aplicación de obsolescencia y cierre financiero (COGS, ajustes contables).
6. Emisión de eventos por WebSocket (`roundProcessed`, `broadcastToGame`).

La implementación real del motor se integra desde `roundProcessor` y `marketEngineV2` (ver sección 3.3).

### 3.3 Motor de Mercado

- Funcionalidad:
  - Calcula demanda total por mercado aplicando modificadores de configuración (`gameConfig.modifiers.demand`) y eventos aleatorios (impacto en la demanda).
  - Construye una lista de competidores válidos (precio > 0, stock > 0) extrayendo decisiones comerciales por plaza.
  - Calcula un `score` por competidor combinando precio (normalizado), marketing (log), quality (`techLevel`), y ethics (`ethicsIndex`) ponderados por parámetros del mercado (`market.params.w_*`).
  - Distribuye demanda proporcionalmente al `score`, aplica penalización por `priceHardCap`, ajusta por elasticidad (`priceSensitivity`) y limita por inventario (ventas reales = min(demanda, stock disponible)).
  - Consume inventario usando FIFO (mediante `inventoryService.consumeStockFIFO`) y calcula `revenue` y `cogs`.
  - Actualiza `company.cash` con las ventas y retorna un resumen por companyId con `revenue`, `cogs` y `units` vendidos.

Coincidencia con la especificación: la lógica coincide con la Sección 2.3 de la especificación (SC, elasticidad, hard-cap, etc.) y añade integración de eventos aleatorios (Sección 4.x).

### 3.4 Persistencia y modelos
- Esquemas esperados según spec: `Company`, `Product`, `RawMaterial`, `Market`, `GameSettings`, y lotes de inventario con campos `units`, `unitCost`, `ageInRounds`.
- El código hace uso de subservicios como `inventoryService`, `capacityService` y `randomEventService` para separar responsabilidades.

### 3.5 WebSockets
- Socket.IO inicializado en `app.js`.
- Eventos manejados: `connection`/`disconnect`, `join-game`, `leave-game`.
- Broadcast: `global.broadcastToGame(gameCode, event, data)`.

---

## 4. Frontend — análisis detallado

Esta sección describe la arquitectura del frontend y los puntos clave, con foco profundo solicitado por el usuario.

### 4.1 Entrada y routing
- `client/src/main.jsx` fuerza el uso de `App` en producción.
- Router principal: `client/src/App.jsx` define rutas públicas y privadas: `/` (login), `/dashboard`, `/decision`, `/admin`, `/rooms`, `/game-over`, y rutas wiki para student/admin.

### 4.2 Autenticación y contexto global
- `client/src/context/AuthContext.jsx` implementa `AuthProvider` y el hook `useAuth()`.
- Persistencia: usa `localStorage` para `token` y `user`. En `useEffect` restaura sesión si ambos existen.
- Funciones expuestas: `user`, `login(email,password)`, `logout()`, `loading`.


### 4.4 Página de decisiones (`DecisionPage.jsx`)
- Arquitectura por pestañas: `ProcurementTab`, `ProductionTab`, `LogisticsTab`, `CommercialTab`, `ToolsTab`.
- Estado local `decision` con forma: `{ production: [], procurement: [], logistics: [], commercial: [] }`.
- On load: solicita `/products`, datos de `materials` (mock en cliente), y `/auth/profile` (para obtener `company` y `game`). También intenta recuperar `/decisions/current`.
- Hook `useGameSimulation(company, decision, products, materials)` realiza simulaciones y validaciones en cliente (p.ej. quota, fondos, stock) y expone `isValid` para habilitar envío.
- `handleSave()` envía `POST /decisions` y navega a `/dashboard` tras éxito.

### 4.5 Componentes clave y UX
- `DecisionModal.jsx`: modal compacto para envío rápido. Calcula costos de MP, manufactura y logística usando constantes embebidas (`MP_COST`, `MANUFACTURE_COST`, etc.). Valida presupuesto, MP disponible y stock de fábrica antes de enviar.
- `Navbar.jsx`: muestra usuario, ronda actual y botón a `/wiki`.
- `DecisionSummary` (componente persistente): resume la decisión y ofrece botón de guardar.

### 4.6 Validaciones cliente vs servidor
- Validaciones cliente: `useGameSimulation` y validaciones en `DecisionModal` (fondos, MP, stock). Estas mejoran UX pero no sustituyen la validación authoritative del servidor (capacidad, reglas de cuota global, lead times, etc.).
- Recomendación: mantener y expandir validaciones cliente, pero asegurar que backend rechace cualquier decisión inválida y devuelva errores claros para que UI muestre feedback legible.

---

## 5. APIs y contratos

Endpoints consumidos por frontend (detectados):
- `POST /api/auth/login` — login
- `GET /api/auth/profile` — obtiene `user`, `company`, `game`
- `GET /api/products` — lista de productos
- `GET /api/decisions/current` — obtener decisión actual
- `POST /api/decisions` — enviar decisión
- `GET /api/decisions/history` — historial (rutas expuestas, controlador a verificar)
- WebSocket namespace: socket.io rooms por `gameCode`, emite `roundProcessed` y otros eventos de juego.

Contractos importantes:
- Formato `decision` (ejemplo minimal):
```json
{
  "production": [{"productLineId": "...", "units": 100}],
  "procurement": [{"material": "Alfa", "units": 200, "supplier": "local"}],
  "logistics": [{"productLineId": "...", "destination": "Novaterra", "units": 50, "method": "Terrestre"}],
  "commercial": [{"market": "Novaterra", "prices": [{"productLine": "...", "price": 150}], "marketingBudget": 5000}]
}
```

Se recomienda publicar un `OpenAPI`/`Swagger` mínimo para estos contratos y el `GameSettings` endpoint.

---
