// ============================================
// FILE: /server/src/app.js
// VERSION: 1.7.1
// DATE: 29-01-2026
// HOUR: 23:25
// PURPOSE: Mejora del logging de errores para depuracion de credenciales.
// CHANGE LOG: Inclusion de detalles de ruta en el log de error del servidor.
// SPEC REF: Seccion 3.1 - Arquitectura
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
const decisionRoutes = require('./routes/decisionRoutes');
const adminRoutes = require('./routes/adminRoutes');

// IMPORTACION DE RUTAS
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();

// 1. SEGURIDAD Y PERFORMANCE
app.use(helmet({ contentSecurityPolicy: false, hidePoweredBy: true }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan('dev'));

// 2. PARSERS Y SANITIZACION
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(function(req, res, next) {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    next();
});
app.use(hpp());

// 3. REGISTRO DE RUTAS OFICIALES
// Importante: El orden importa. Primero las rutas, luego los errores.
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);

// 4. RUTA DE SALUD
app.get('/api/health', function(req, res) {
    res.status(200).json({ status: 'success', server: 'ElectroNova OK' });
});

// 5. MANEJADOR DE ERRORES GLOBAL MEJORADO
app.use(function(err, req, res, next) {
    // Log detallado en la consola del servidor para el desarrollador
    console.error('--------------------------------------------');
    console.error('[ERROR LOG]');
    console.error('Ruta:', req.originalUrl);
    console.error('Metodo:', req.method);
    console.error('Mensaje:', err.message);
    console.error('Status:', err.status || 500);
    console.error('--------------------------------------------');

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor'
    });
});

app.use('/api/decisions', decisionRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;