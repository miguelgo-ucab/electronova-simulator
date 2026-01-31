// ============================================
// FILE: /server/src/seeds/checkData.js
// VERSION: 1.0.0
// DATE: 31-01-2026
// HOUR: 10:30
// PURPOSE: Script de auditoria para verificar la integridad de los datos maestros.
// CHANGE LOG: Creacion inicial para depuracion de bases de datos vacias.
// SPEC REF: Seccion 3.4 - Persistencia
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');
const env = require('../config/env');
const Market = require('../models/Market');
const Product = require('../models/Product');

async function checkIntegrity() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        const marketCount = await Market.countDocuments();
        const productCount = await Product.countDocuments();

        console.log('--- AUDITORIA DE SISTEMA ---');
        console.log('Base de Datos: ' + env.MONGODB_URI);
        console.log('Mercados cargados: ' + marketCount);
        console.log('Productos cargados: ' + productCount);
        
        if (marketCount === 0 || productCount === 0) {
            console.error('ALERTA: Faltan datos maestros. Ejecute masterData.js primero.');
        } else {
            console.log('ESTADO: LISTO PARA SIMULACION.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error de conexion: ' + error.message);
        process.exit(1);
    }
}

checkIntegrity();