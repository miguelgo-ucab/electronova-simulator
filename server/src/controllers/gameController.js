// ============================================
// FILE: /server/src/controllers/gameController.js
// VERSION: 1.3.0
// DATE: 03-02-2026
// HOUR: 08:50
// PURPOSE: Gestión de salas múltiples y asignación de capacidad.
// CHANGE LOG: Adición de getAllGames para el panel administrativo.
// SPEC REF: Sección 3.2 (Partidas) y 4.1 (Modelos)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Game = require('../models/Game');
const Company = require('../models/Company');

/**
 * Obtiene todas las salas registradas en el sistema (Solo para Admin).
 */
exports.getAllGames = async function(req, res, next) {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: { games } });
    } catch (error) { next(error); }
};

exports.createGame = async function(req, res, next) {
    try {
        const { gameCode, maxRounds, totalCapacity } = req.body;
        const newGame = await Game.create({
            gameCode: gameCode.toUpperCase(),
            maxRounds: maxRounds || 8,
            totalCapacity: totalCapacity || 6000,
            createdBy: req.user._id,
            status: 'active'
        });
        res.status(201).json({ status: 'success', data: { game: newGame } });
    } catch (error) { 
        if (error.code === 11000) {
            const err = new Error('El código de sala ya está en uso.');
            err.status = 400;
            return next(err);
        }
        next(error); 
    }
};

exports.advanceRound = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);
        if (!game || game.status === 'finished') throw new Error('Partida no disponible.');

        game.currentRound += 1;
        if (game.currentRound > game.maxRounds) game.status = 'finished';
        await game.save();

        const activeCompanies = await Company.find({ gameId: game._id, isBankrupt: false });
        const quota = activeCompanies.length > 0 ? Math.floor(game.totalCapacity / activeCompanies.length) : 0;

        await Company.updateMany({ gameId: game._id, isBankrupt: false }, { $set: { productionQuota: quota } });

        if (global.io) {
            global.io.emit('timeAdvance', { newRound: game.currentRound, newQuota: quota });
        }

        res.status(200).json({ status: 'success', data: { currentRound: game.currentRound } });
    } catch (error) { next(error); }
};

exports.joinGame = async function(req, res, next) {
    try {
        const { gameCode } = req.body;
        const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
        if (!game) {
            const err = new Error('CÓDIGO DE SALA INVÁLIDO O INEXISTENTE.');
            err.status = 404;
            return next(err);
        }
        
        const company = await Company.findByIdAndUpdate(
            req.user.companyId,
            { gameId: game._id },
            { new: true }
        );

        res.status(200).json({ status: 'success', message: `Unido a la sala ${gameCode}`, data: { company } });
    } catch (error) { next(error); }
};