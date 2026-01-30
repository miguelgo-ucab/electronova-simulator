// ============================================
// FILE: /server/src/app.js
// VERSION: 1.6.0
// DATE: 29-01-2026
// HOUR: 18:30
// PURPOSE: Version consolidada con depuracion de errores para Express 5.
// CHANGE LOG: Integracion de sanitizacion directa y manejador de errores global.
// SPEC REF: Seccion 3.1 - Middlewares de seguridad
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');
const sanitize = require('mongo-sanitize');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. SEGURIDAD Y PERFORMANCE BASE
app.use(helmet({ contentSecurityPolicy: false, hidePoweredBy: true }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan('dev'));

// 2. PARSERS DE CUERPO (Body Parsers)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. MIDDLEWARE DE SANITIZACION DIRECTO (Para evitar errores de importacion)
app.use(function(req, res, next) {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    // En Express 5 no tocamos req.query directamente para evitar conflictos
    next();
});

app.use(hpp());

// 4. RUTAS
// Verificamos que authRoutes sea una funcion valida antes de usarla
if (typeof authRoutes === 'function' || (authRoutes.stack && authRoutes.stack.length > 0)) {
    app.use('/api/auth', authRoutes);
} else {
    console.error('[CRITICAL] authRoutes no es un Router de Express valido');
}

// 5. RUTA DE SALUD
app.get('/api/health', function(req, res) {
    res.status(200).json({ status: 'success', server: 'ElectroNova OK' });
});

// 6. MANEJADOR DE ERRORES GLOBAL (El "Caza-Bugs")
// Este middleware DEBE tener 4 argumentos para que Express lo reconozca como tal
app.use(function(err, req, res, next) {
    console.error('--- ERROR DETECTADO ---');
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    console.error('-----------------------');

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor'
    });
});

module.exports = app;