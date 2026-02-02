// ============================================
// FILE: /client/src/services/socket.js
// VERSION: 1.0.2
// DATE: 01-02-2026
// HOUR: 22:05
// PURPOSE: Singleton de conexion Socket.IO para el Frontend.
// CHANGE LOG: Re-creacion del archivo para resolver error de importacion en Vite.
// SPEC REF: Seccion 4.6 - WebSockets Frontend
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import { io } from 'socket.io-client';

// En desarrollo usamos la URL directa del servidor
const SOCKET_URL = 'http://localhost:5000';

console.log('[SOCKET-LOG] Intentando conectar con el servidor en:', SOCKET_URL);

// Configuracion de conexion de Grado Industrial
export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    reconnectionAttempts: 5
});

// Escuchas de depuracion inicial
socket.on('connect', () => {
    console.log('[SOCKET-LOG] Conexion establecida. ID de sesion:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('[SOCKET-LOG] Error de conexion:', error.message);
});

export default socket;