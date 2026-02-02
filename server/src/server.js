// ============================================
// FILE: /server/src/server.js
// VERSION: 1.3.1
// DATE: 01-02-2026
// HOUR: 21:50
// PURPOSE: Refuerzo de configuracion de Socket.IO y depuracion de red.
// CHANGE LOG: Uso de origin explicito y logs de conexion detallados.
// SPEC REF: Seccion 3.5 - WebSockets
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');

// 1. Crear Servidor HTTP vinculando la App de Express
const server = http.createServer(app);

// 2. Inicializar Socket.IO con CORS explícito para evitar bloqueos del navegador
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL exacta del Frontend en desarrollo
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Asegura compatibilidad con navegadores antiguos
});

// 3. Lógica de Gestión de Terminales Conectados
io.on('connection', (socket) => {
    console.log('--------------------------------------------');
    console.log('[SOCKET] NUEVA CONEXION DETECTADA');
    console.log('ID:', socket.id);
    console.log('--------------------------------------------');

    // Manejo de salas por partida (GameCode)
    socket.on('join-game', (gameCode) => {
        socket.join(gameCode);
        console.log(`[SOCKET] Usuario unido a la sala: ${gameCode}`);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[SOCKET] Terminal desconectado (${socket.id}). Motivo: ${reason}`);
    });
});

// Hacer 'io' accesible para disparar notificaciones desde los controladores (Admin)
global.io = io;

// 4. Conexión autoritativa a la Base de Datos y arranque del servidor
const dbOptions = { autoIndex: true, maxPoolSize: 10 };

mongoose.connect(env.MONGODB_URI, dbOptions)
    .then(() => {
        console.log('[DB] CONEXION ESTABLECIDA EXITOSAMENTE');
        server.listen(env.PORT, () => {
            console.log('============================================');
            console.log(`SISTEMA ELECTRONOVA LISTO EN PUERTO: ${env.PORT}`);
            console.log('MODO: TIEMPO REAL ACTIVO');
            console.log('============================================');
        });
    })
    .catch((err) => {
        console.error('[DB ERROR CRITICO]:', err.message);
        process.exit(1);
    });