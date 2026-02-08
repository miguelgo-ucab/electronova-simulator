// ============================================
// FILE: /server/src/routes/gameRoutes.js
// VERSION: 1.3.0
// DATE: 07-02-2026
// HOUR: 19:10
// PURPOSE: Rutas de juego con validación de existencia de controladores.
// CHANGE LOG: Protección contra undefined handlers para evitar crashes.
// SPEC REF: Sección 3.2
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const express = require('express');
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// VALIDACIÓN DE SEGURIDAD: Verificar que el controlador se cargó bien
if (!gameController || !gameController.joinGame || !gameController.getAllGames) {
    console.error('ERROR CRÍTICO: gameController no se cargó correctamente. Verifique las exportaciones.');
    // No detenemos el proceso, pero las rutas fallarán controladamente
}

router.use(authMiddleware.protect);

// Rutas Estudiante
router.post('/join', gameController.joinGame);

// Rutas Admin
router.use(authMiddleware.restrictTo('admin'));

// Asegurarse de que cada función existe antes de asignarla a la ruta
if (gameController.getAllGames) router.get('/all', gameController.getAllGames);
if (gameController.createGame) router.post('/create', gameController.createGame);
if (gameController.advanceRound) router.post('/:gameId/advance', gameController.advanceRound);
if (gameController.deleteGame) router.delete('/:gameId', gameController.deleteGame);
if (gameController.updateGame) router.put('/:gameId', gameController.updateGame);

module.exports = router;