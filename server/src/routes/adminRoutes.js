// ============================================
// FILE: /server/src/routes/adminRoutes.js
// VERSION: 1.2.0
// DATE: 30-01-2026
// HOUR: 22:30
// PURPOSE: Definicion de rutas administrativas protegidas por rol.
// CHANGE LOG: Registro del endpoint /process-logistics.
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

// Proteccion global: Solo usuarios autenticados y con rol 'admin'
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Endpoints de Cierre de Fase
router.post('/process-procurement', adminController.processProcurementPhase);
router.post('/process-production', adminController.processProductionPhase);
router.post('/process-logistics', adminController.processLogisticsPhase);
router.post('/process-sales', adminController.processSalesPhase);

module.exports = router;