// ============================================
// FILE: /server/src/routes/decisionRoutes.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 10:15
// PURPOSE: Rutas para el envio de decisiones de los jugadores.
// CHANGE LOG: Implementacion de ruta POST para abastecimiento con proteccion JWT.
// SPEC REF: Seccion 5 - Endpoints REST
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const decisionController = require('../controllers/decisionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticacion
router.use(authMiddleware.protect);

// Ruta para guardar/actualizar compras de materia prima
router.post('/procurement', decisionController.saveProcurementDecision);

module.exports = router;