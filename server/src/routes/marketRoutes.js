// ============================================
// FILE: /server/src/routes/marketRoutes.js
// VERSION: 1.0.0
// DATE: 01-02-2026
// HOUR: 16:20
// PURPOSE: Definicion de rutas para el acceso a datos de mercado.
// CHANGE LOG: Ruta protegida por JWT pero accesible para todos los roles.
// SPEC REF: Seccion 5.1 - Formulario de Decisiones
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const marketController = require('../controllers/marketController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Proteccion: Solo usuarios logueados pueden ver el mercado
router.use(authMiddleware.protect);

// Ruta GET para obtener los mercados
router.get('/', marketController.getAllMarkets);

module.exports = router;