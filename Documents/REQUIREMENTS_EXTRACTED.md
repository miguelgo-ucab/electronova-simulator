# Requisitos extraídos — ElectroNova (resumen)

Fecha: 2026-01-28
Fuentes: `AGENTS.md`, los archivos dentro de `Documents/` (specs, manuales, informes) y el código existente referenciado en el informe técnico.

## 1. Objetivo general
Desarrollar y mantener un simulador empresarial multiplayer (ElectroNova) conforme a la especificación técnica y los manuales de estilo, implementando motor de mercado ECPCIM, interfaz educativa en español y comunicación en tiempo real.

## 2. Requisitos funcionales (priorizados)
- Autenticación y autorización: registro/login con JWT, perfil y asociación `Company`.
- Gestión de partidas: crear/join/reset partidas, salas por `gameCode`, roles (estudiante/admin).
- Ciclo de rondas: procesamiento por rondas (configurable, p.ej. 8 rondas), con procesamiento authoritative en backend.
- Decisiones por empresa: procurement, production, logistics, commercial (precios, marketing). Validación server-side de capacidad y fondos.
- Motor de mercado (ECPCIM): elasticidad, hard-cap de precio, scoring competitivo, distribución de demanda por plaza y producto.
- Inventarios y tránsito: lotes de MP y PT con `roundsUntilArrival`, FIFO para consumo, obsolescencia por edad.
- Capacidad compartida: capacidad total (ej. 6000/u) repartida entre empresas activas; bloqueo en UI si se excede.
- Eventos aleatorios: motor de 10 tipos con historial y control administrativo.
- Panel administrativo: endpoints para control de eventos, configuración de game-settings y estadísticas.
- Comunicación en tiempo real: Socket.IO para `roundProcessed`, `broadcastToGame`, conexiones y salas.
- Seed y scripts: `npm run seed:v2` para poblar DB con datos de prueba.
- Documentación y manuales en español: UI, mensajes y manuales de usuario/administrador.

## 3. Requisitos no funcionales
- Stack: React 19 + Vite (client), Node.js + Express 5 + Socket.IO (server), MongoDB + Mongoose.
- Estilo y branding: Tailwind CSS con paleta `#0F172A`, `#3B82F6`, tipografías indicadas; accesibilidad WCAG 2.1.
- Seguridad: JWT expirables, rate limiting, helmet, sanitización de inputs, CORS configurado, logging con rotación.
- Observabilidad: métricas Prometheus, health checks, alertas.
- Tests: unitarios (Jest) y pruebas de integración para `marketEngineV2`.
- Localización: UI en español (español neutro latinoamericano).

## 4. Modelos de datos clave (mínimos)
- `User` (id, email, passwordHash, role, companyId)
- `Company` (id, name, cash, techLevel, ethicsIndex, productionQuota, active)
- `Product` (id, name[Alta|Media|Básica], baseProductionCost, rawMaterialFormula)
- `RawMaterial` (id, name[Alfa|Beta|Omega], baseCost)
- `Supplier` (id, type, costMultiplier, leadTime, ethicsImpact)
- `Market` (id, name, demandPotential, priceSensitivity, priceHardCap, qualityPreference)
- `InventoryLot` (type[MP/PT], ownerCompany, productLine/material, units, unitCost, roundsUntilArrival, ageInRounds)
- `Game` / `GameSettings` (rounds, capacityTotal, marketParams, modifiers)

## 5. Endpoints REST mínimos a implementar
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`
- `POST /api/games`, `POST /api/games/:id/join`, `GET /api/games/:id/status`
- `GET /api/products`, `GET /api/markets`, `GET /api/game-settings`
- `GET /api/decisions/current`, `POST /api/decisions`, `GET /api/decisions/history`
- `POST /api/admin/process-round`, `POST /api/admin/events` (protegidos)

## 6. Validaciones y reglas críticas (server-authoritative)
- Comprobación de productionQuota por empresa y por ronda.
- Verificación de fondos suficientes (cash) antes de aceptar procurement/production/logistics.
- Control de lead times: MP comprada con leadTime no disponible antes de su llegada.
- Consumo FIFO y cálculo de COGS en ventas.
- Rechazo de decisiones inválidas con mensajes claros (código y texto en español).







