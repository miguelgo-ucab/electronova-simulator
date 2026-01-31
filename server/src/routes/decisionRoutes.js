// ============================================
// FILE: /server/src/routes/decisionRoutes.js
// VERSION: 1.1.1
// DATE: 30-01-2026
// HOUR: 21:30
// PURPOSE: Estructura de rutas para decisiones de juego.
// CHANGE LOG: Verificacion de endpoint /save.
// SPEC REF: Seccion 5.1 - Formulario de Decisiones
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const decisionController = require('../controllers/decisionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware de proteccion global para estas rutas
router.use(authMiddleware.protect);

// Endpoint para guardar decisiones (Abastecimiento y Produccion)
router.post('/save', decisionController.saveDecision);

module.exports = router;