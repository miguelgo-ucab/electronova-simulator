const express = require('express');
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
router.use(authMiddleware.protect);

// Ruta para que el estudiante se una a una partida
router.post('/join', gameController.joinGame);

router.post('/create', authMiddleware.restrictTo('admin'), gameController.createGame);
router.post('/:gameId/advance', authMiddleware.restrictTo('admin'), gameController.advanceRound);
module.exports = router;