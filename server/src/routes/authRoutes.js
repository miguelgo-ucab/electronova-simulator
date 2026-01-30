// ============================================
// FILE: /server/src/routes/authRoutes.js
// VERSION: 1.1.0
// DATE: 29-01-2026
// HOUR: 18:50
// PURPOSE: Definicion de rutas de autenticacion con exportacion limpia.
// CHANGE LOG: Verificacion de exportacion para evitar errores de middleware.
// SPEC REF: Seccion 5 - Endpoints REST
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Definicion explicita de rutas
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;