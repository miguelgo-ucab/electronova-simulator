// ============================================
// FILE: /server/src/controllers/gameController.js
// VERSION: 1.4.0
// DATE: 07-02-2026
// HOUR: 11:10
// PURPOSE: Gestion CRUD completa de salas de simulacion.
// CHANGE LOG: Adicion de metodo updateGame y soporte de parametros extendidos.
// SPEC REF: Seccion 3 - Fase 0.2
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const Game = require('../models/Game');
const Company = require('../models/Company');

// Obtener todas las salas
exports.getAllGames = async function(req, res, next) {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: { games } });
    } catch (error) { next(error); }
};

// Crear Sala con Parametros
exports.createGame = async function(req, res, next) {
    try {
        const { gameCode, maxRounds, totalCapacity, obsolescenceRate, initialCash } = req.body;
        
        const newGame = await Game.create({
            gameCode: gameCode.toUpperCase(),
            maxRounds: maxRounds || 8,
            totalCapacity: totalCapacity || 6000,
            obsolescenceRate: obsolescenceRate || 10,
            initialCash: initialCash || 500000,
            createdBy: req.user._id
        });

        res.status(201).json({ status: 'success', data: { game: newGame } });
    } catch (error) { 
        if (error.code === 11000) {
            const err = new Error('El código de sala ya existe.');
            err.status = 400;
            return next(err);
        }
        next(error); 
    }
};

// EDITAR SALA (Nuevo)
exports.updateGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const updates = req.body; // { maxRounds, totalCapacity, etc. }
        
        const game = await Game.findByIdAndUpdate(gameId, updates, { new: true, runValidators: true });
        
        if (!game) {
            const err = new Error('Sala no encontrada');
            err.status = 404;
            return next(err);
        }

        res.status(200).json({ status: 'success', message: 'Configuración actualizada.', data: { game } });
    } catch (error) { next(error); }
};

// Eliminar Sala
exports.deleteGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        await Game.findByIdAndDelete(gameId);
        // Liberar empresas vinculadas (Opcional: o borrarlas)
        await Company.updateMany({ gameId: gameId }, { $unset: { gameId: 1 } });
        res.status(200).json({ status: 'success', message: 'Sala eliminada.' });
    } catch (error) { next(error); }
};

// ... (joinGame y advanceRound se mantienen igual que la versión anterior, asegúrate de incluirlos abajo)
exports.joinGame = async function(req, res, next) {
    try {
        const { gameCode } = req.body;
        const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
        if (!game) {
            const err = new Error('CÓDIGO INVÁLIDO.');
            err.status = 404;
            return next(err);
        }
        const company = await Company.findByIdAndUpdate(req.user.companyId, { gameId: game._id }, { new: true });
        res.status(200).json({ status: 'success', data: { company } });
    } catch (error) { next(error); }
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

        if (global.io) global.io.emit('timeAdvance', { newRound: game.currentRound, newQuota: quota });

        res.status(200).json({ status: 'success', data: { currentRound: game.currentRound } });
    } catch (error) { next(error); }
};