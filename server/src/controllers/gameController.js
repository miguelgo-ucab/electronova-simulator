// ============================================
// FILE: /server/src/controllers/gameController.js
// VERSION: 1.1.0
// DATE: 01-02-2026
// HOUR: 22:55
// PURPOSE: Extension de logica para inscripcion de empresas en salas.
// CHANGE LOG: Implementacion de joinGame con validacion de existencia.
// SPEC REF: Seccion 3.2 - Ciclo de Procesamiento
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Game = require('../models/Game');
const Company = require('../models/Company');

/**
 * Crea una nueva partida con un codigo unico.
 */
exports.createGame = async function(req, res, next) {
    try {
        const { gameCode, maxRounds } = req.body;
        const newGame = await Game.create({
            gameCode,
            maxRounds: maxRounds || 8,
            createdBy: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: { game: newGame }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Avanza el reloj del juego a la siguiente ronda.
 */
exports.advanceRound = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);

        if (game.currentRound >= game.maxRounds) {
            const err = new Error('El juego ya ha alcanzado el limite de rondas.');
            err.status = 400;
            return next(err);
        }

        game.currentRound += 1;
        await game.save();

        // Notificar a todos que el tiempo ha pasado
        if (global.io) {
            global.io.emit('timeAdvance', { 
                newRound: game.currentRound,
                message: 'La gerencia ha iniciado una nueva ronda.' 
            });
        }

        res.status(200).json({
            status: 'success',
            data: { currentRound: game.currentRound }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Vincula la empresa del usuario actual a una partida mediante el gameCode.
 */
exports.joinGame = async function(req, res, next) {
    try {
        const { gameCode } = req.body;
        
        // 1. Buscar la partida
        const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
        if (!game) {
            const err = new Error('El codigo de partida no es valido.');
            err.status = 404;
            return next(err);
        }

        // 2. Verificar que el usuario tenga empresa
        if (!req.user.companyId) {
            const err = new Error('Debes fundar una empresa antes de unirte a un juego.');
            err.status = 400;
            return next(err);
        }

        // 3. Vincular empresa a la partida
        const company = await Company.findByIdAndUpdate(
            req.user.companyId,
            { gameId: game._id },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            message: `Te has unido exitosamente a la partida ${gameCode}`,
            data: { company }
        });
    } catch (error) {
        next(error);
    }
};