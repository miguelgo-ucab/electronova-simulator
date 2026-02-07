Estilo y Descripción de la Aplicación "ElectroNova Simulator"
I. Estilo Técnico y de Diseño
1. Arquitectura y Stack Tecnológico
Framework: React 18+ con Functional Components y Hooks
Estilización: Tailwind CSS (clases utilitarias) con estilos inline para casos específicos
Manejo de Estado: useState, useEffect, useCallback, useMemo (React nativo)
Navegación: React Router DOM v6
Comunicación en Tiempo Real: Socket.io-client
Gráficas: Recharts (AreaChart, LineChart)
HTTP Client: Axios (configurado en api.v2.js)
Estructura de Archivos: Separación por páginas y componentes reutilizables

2. Patrones de Diseño Identificados
Patrón Component-Based Architecture
Componentes de Páginas: Cada vista principal es un componente de página independiente

Componentes Reutilizables: Modales, pestañas, resúmenes, timers

Layout Consistente: Header, Main, Footer en todas las páginas

Patrón Container-Presentation
Container Components: AdminDashboard, DashboardPage (manejan estado y lógica)

Presentation Components: GameConfigModal, DecisionSummary (reciben props)

Patrón de Composición
Subcomponentes anidados dentro de archivos principales (ej: GameControlPanel en AdminDashboard)

Inyección de dependencias a través de props

3. Sistema de Diseño Visual
Paleta de Colores (Dark Theme)
Fondo Principal: #0F172A (slate-900)

Fondo Secundario: #1E293B (slate-800)

Colores de Acento:

Azul: #3B82F6 (blue-500) - acciones primarias

Verde: #10B981 (emerald-400) - estados positivos

Rojo: #EF4444 - alertas, botones críticos

Amarillo: #F59E0B - advertencias, tránsito

Púrpura/Esmeralda: Para énfasis especial

Tipografía
Familia: 'Inter' o sans-serif por defecto

Jerarquía:

Títulos: 1.5rem - 3rem, bold

Subtítulos: 1rem - 1.5rem

Cuerpo: 0.875rem - 1rem

Labels pequeños: 0.75rem - 0.875rem

Font Weight: Bold para énfasis, normal para texto secundario

Espaciado y Layout
Padding: Consistente (p-4, p-6, p-8)

Margin: Gutters uniformes

Border Radius: 0.375rem (rounded), 0.75rem (rounded-lg)

Grid System: Grid de Tailwind (grid-cols-1, md:grid-cols-2, lg:grid-cols-3)

Breakpoints: Mobile-first con adaptaciones para md (768px) y lg (1024px)

Componentes de Interfaz Recurrentes
Tarjetas (Cards): Fondo slate-800, borde slate-700, rounded-lg

Botones:

Primarios: bg-blue-600, hover:bg-blue-500

Secundarios: border-slate-600, hover:bg-slate-700

Destructivos: bg-red-600, hover:bg-red-500

Tablas: Encabezados slate-900, filas alternadas, texto alineado

Modales: Fondo overlay negro/80, contenido centrado, shadow-2xl

Badges/Estados: Colores semánticos (verde=activo, rojo=error, amarillo=pending)

4. Patrones de Código React
Manejo de Estado
javascript
// Patrón común: múltiples estados relacionados
const [games, setGames] = useState([]);
const [selectedGame, setSelectedGame] = useState(null);
const [loading, setLoading] = useState(true);
Efectos con Dependencias
javascript
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 5000);
  return () => clearInterval(interval);
}, [loadData]); // useCallback para optimizar
Patrón de Fetching Paralelo
javascript
const [gamesRes, profileRes] = await Promise.all([
  api.get('/admin/games'),
  api.get('/auth/profile')
]);
5. Convenciones de Nomenclatura
Componentes: PascalCase (AdminDashboard, GameControlPanel)

Variables/Funciones: camelCase (handleDeleteGame, submitCreateGame)

Archivos: PascalCase para componentes, camelCase para otros

Props: camelCase, descriptivas (onBack, initialData, targetDate)

6. Manejo de Errores y Loading States
Loading States: Spinners o texto "Cargando..." con fondo coherente

Error Handling: Try-catch con alertas descriptivas

Validación: Validación en frontend antes de enviar al backend

Feedback: Alertas nativas con emojis y mensajes claros

II. Descripción Detallada de la Aplicación
1. Propósito y Contexto
ElectroNova Simulation es una plataforma educativa de simulación empresarial diseñada para enseñanza de estrategias de negocio, gestión de operaciones y toma de decisiones en entornos competitivos.

Contexto Pedagógico:

Simulación de mercado competitivo con múltiples empresas

Enfoque en cadena de suministro: compras → producción → logística → ventas

Mecánicas de mercado realistas (elasticidad de precios, estudios de mercado)

Evaluación multicriterio (Winner Scorecard - WSC)

2. Roles y Flujos de Usuario
Rol: Docente/Administrador
Acceso: Panel docente (/admin)

Capacidades:

Crear, editar y eliminar salas de simulación

Configurar parámetros del juego (capital, rondas, duración)

Iniciar y procesar rondas

Monitorear progreso de todos los estudiantes en tiempo real

Ver historial detallado de decisiones por empresa

Acceso a documentación pedagógica

Rol: Estudiante
Acceso: Dashboard del CEO (/dashboard)

Capacidades:

Unirse a salas con código

Gestionar empresa virtual en 4 áreas:

Compras: Materia prima (Alfa, Beta, Omega)
Producción: Fabricación (Alta, Media, Básica)
Logística: Distribución a 4 plazas
Ventas: Precios y marketing
Consultar estudios de mercado

Ver métricas financieras en tiempo real

Acceder a manual de estrategia

3. Módulos Principales
A. Sistema de Autenticación y Registro
Login Unificado: Formulario único para login/registro

Registro con Código: Los estudiantes necesitan código de sala

Persistencia: Token en localStorage, redirección por rol

Gestión de Sesión: Logout con limpieza de tokens

B. Panel de Control Docente (AdminDashboard)
Vista General: Grid de salas con estado y progreso

Control por Sala:

Timer de ronda activa

Botones de acción (Iniciar, Procesar)

Tabla de estudiantes con estados

Inspección de historial por empresa

Modal de Configuración: Parámetros personalizables

C. Dashboard del Estudiante (DashboardPageV2)
KPI Principales:

Caja disponible (con proyección)

Nivel tecnológico

Índice de ética

Visualizaciones:

Gráfica de utilidad neta acumulada

Evolución de caja vs ventas

Gestión de Inventarios:

Materia prima (stock, tránsito, consumo)

Producto terminado por plaza

Historial de Decisiones: Timeline de rondas pasadas

D. Terminal de Decisiones (DecisionPage)
Flujo de Toma de Decisiones:

Compras: Selección de proveedores (local/importado)
Producción: Asignación de capacidad compartida
Logística: Transporte (aéreo/terrestre)
Ventas: Precios y presupuesto de marketing
Herramientas: Estudios de mercado
Simulación en Tiempo Real: Previsualización de impacto financiero

Validación: Restricciones de capital y capacidad

E. Sistema de Simulación
Motor de Cálculo (useGameSimulation):

Proyección de flujo de caja

Consumo de materiales

Capacidad compartida

Validación de restricciones

Algoritmo ECPCIM: Cálculo de cuota de mercado basado en:

Precio inverso (w1)

Calidad (w2)

Marketing logarítmico (w3)

Ética (w4)

F. Sistema de Comunicación en Tiempo Real
WebSockets: Notificaciones de cambio de ronda

Auto-refresh: Polling cada 5s en paneles críticos

Redirección Automática: Fin de juego → pantalla de resultados

G. Sistema de Documentación
Wiki Docente: Guía pedagógica y técnica

Wiki Estudiante: Manual estratégico paso a paso

Sintaxis Corregida: JSX válido, escape de caracteres

4. Mecánicas de Juego
Variables de Mercado
Elasticidad de Precio: Sensibilidad de la demanda

Hard Cap: Precio máximo psicológico

Pesos de Preferencia: w1-w4 del algoritmo ECPCIM

Restricciones y Reglas
Capacidad Compartida: 6,000 unidades totales

Lead Times:

Proveedores locales: 0 ronda (+20% costo, +5 ética)

Proveedores importados: 1 rondas

Logística:

Aéreo: $15/u, 0 rondas

Terrestre: $5/u, 1 ronda

Obsolescencia: Multa del 10% para lotes >3 rondas

Eventos Aleatorios: 15% probabilidad por ronda

Sistema de Puntuación (WSC)
text
WSC = 0.4*(Utilidad) + 0.3*(Ventas) + 0.2*(Ética) + 0.1*(Tech)
5. Flujos de Datos y API
Estructura de Datos
Juego (Game): Configuración, estado, código, rondas

Empresa (Company): Cash, inventario, ética, nivel tech

Decisión (Decision): Arrays para cada sección (production, procurement, etc.)

Productos/Materiales: Catálogo con costos y requerimientos

Endpoints Clave
Autenticación: /auth/login, /auth/register

Gestión de Juegos: /admin/games, /admin/games/:id

Decisiones: /decisions, /decisions/current

Finanzas: /financials

Ranking: /admin/games/:id/ranking

6. Experiencia de Usuario
Para Docentes
Onboarding Simple: Crear sala → compartir código

Control Granular: Pausar, reanudar, ajustar parámetros

Monitoreo en Vivo: Ver progreso sin interrumpir juego

Documentación Integrada: Guías técnicas accesibles

Para Estudiantes
Interfaz Guiada: Tabs secuenciales para decisiones

Feedback Inmediato: Proyecciones en tiempo real

Contexto Estratégico: Wiki accesible desde cualquier punto

Motivación Competitiva: Ranking visible, métricas claras

7. Características Técnicas Destacadas
Performance
Optimización: useCallback, useMemo para cálculos pesados

Lazy Loading: Componentes modales cargados condicionalmente

Polling Inteligente: Solo en vistas que requieren actualización

Mantenibilidad
Separación de Responsabilidades: Componentes pequeños y reutilizables

Estilos Consistentes: Tailwind configurado sistemáticamente

Manejo de Errores: Try-catch con mensajes descriptivos

Escalabilidad
Arquitectura Modular: Fácil adición de nuevas mecánicas

Sistema de Plugin: Hooks reutilizables (useGameSimulation)

API RESTful: Estructura predecible y documentada

8. Consideraciones Pedagógicas Integradas
Aprendizaje Basado en Problemas
Escasez de Recursos: Capital limitado, capacidad compartida

Trade-offs: Calidad vs costo, velocidad vs precio

Análisis de Datos: Estudios de mercado opcionales pero valiosos

Evaluación Formativa
Feedback Continuo: Proyecciones después de cada decisión

Historial de Decisiones: Permite reflexión sobre elecciones pasadas

Múltiples Métricas: No solo ganancias, también ética y tecnología

Competencia Colaborativa
Mercado Compartido: Decisiones afectan a otros jugadores

Ranking Transparente: Posiciones visibles, criterios claros

Final de Juego Definido: Rondas limitadas, resultado final claro