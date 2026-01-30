// ============================================
// FILE: /server/src/seeds/clearUsers.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 18:00
// PURPOSE: Script de utilidad para limpiar la coleccion de usuarios.
// CHANGE LOG: Creacion inicial para facilitar pruebas de desarrollo.
// SPEC REF: Requisitos Tecnicos - Mantenimiento
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

async function clearUsers() {
    try {
        // 1. Conectar a la base de datos usando nuestra config segura
        await mongoose.connect(env.MONGODB_URI);
        console.log('[MAINTENANCE] Conectado para limpieza...');

        // 2. Eliminar todos los documentos de la coleccion Users
        const result = await User.deleteMany({});
        
        console.log('[MAINTENANCE] Usuarios eliminados: ' + result.deletedCount);
        console.log('[MAINTENANCE] Base de datos de usuarios limpia.');
        
        // 3. Cerrar conexion y salir exitosamente
        process.exit(0);
    } catch (error) {
        console.error('[MAINTENANCE] Error en la limpieza: ' + error.message);
        process.exit(1);
    }
}

// Ejecutar la funcion
clearUsers();