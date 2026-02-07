// ============================================
// FILE: /server/src/routes/gameRoutes.js
// VERSION: 1.2.0
// DATE: 06-02-2026
// HOUR: 22:35
// PURPOSE: Rutas unificadas para gestión de salas (Estudiante y Admin).
// CHANGE LOG: Consolidación de rutas para evitar duplicidad de router.
// SPEC REF: Sección 3.2 y 5.2
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const express = require('express');
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Protección Global: Todo requiere estar logueado
router.use(authMiddleware.protect);

// --- RUTAS DE ESTUDIANTE ---
router.post('/join', gameController.joinGame);

// --- RUTAS DE ADMINISTRADOR ---
// A partir de aquí, solo pasa si es 'admin'
router.use(authMiddleware.restrictTo('admin'));

router.get('/all', gameController.getAllGames);        // Listar salas (Lobby)
router.post('/create', gameController.createGame);     // Crear sala
router.delete('/:gameId', gameController.deleteGame);  // Borrar sala
router.post('/:gameId/advance', gameController.advanceRound); // Avanzar tiempo
router.put('/:gameId', gameController.updateGame); // Editar sala (Nuevo)

module.exports = router;