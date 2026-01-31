// ============================================
// FILE: /server/src/routes/adminRoutes.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 11:25
// PURPOSE: Rutas protegidas para la gestion docente del simulador.
// CHANGE LOG: Aplicacion de middleware restrictTo('admin').
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Proteger todas las rutas: Solo usuarios logueados
router.use(authMiddleware.protect);

// 2. Restringir todas las rutas: Solo usuarios con rol 'admin'
router.use(authMiddleware.restrictTo('admin'));

// Ruta para procesar el cierre de abastecimiento
router.post('/process-procurement', adminController.processProcurementPhase);

module.exports = router;