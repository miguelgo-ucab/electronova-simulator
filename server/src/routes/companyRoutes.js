// ============================================
// FILE: /server/src/routes/companyRoutes.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 22:45
// PURPOSE: Definicion de rutas para la gestion de empresas.
// CHANGE LOG: Uso de middleware 'protect' para asegurar que solo usuarios logueados accedan.
// SPEC REF: Seccion 5 - Endpoints REST
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// TODAS las rutas de empresa requieren estar logueado
router.use(authMiddleware.protect);

router.post('/register', companyController.createCompany);
router.get('/my-company', companyController.getMyCompany);

module.exports = router;