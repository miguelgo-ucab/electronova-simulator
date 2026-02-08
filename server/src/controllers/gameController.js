// ============================================
// FILE: /server/src/controllers/gameController.js
// VERSION: 1.8.0
// DATE: 08-02-2026
// HOUR: 12:50
// PURPOSE: Gestión de salas con soporte robusto de Socket.IO Rooms.
// CHANGE LOG: Uso de io.to(gameCode) para aislamiento de eventos.
// SPEC REF: Sección 3.5 - WebSockets
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const Game = require('../models/Game');
const Company = require('../models/Company');
const User = require('../models/User');

// ... (getAllGames, createGame, joinGame se mantienen igual) ...
exports.getAllGames = async function(req, res, next) {
    try {
        const games = await Game.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: { games } });
    } catch (error) { next(error); }
};

exports.createGame = async function(req, res, next) {
    try {
        const { gameCode, maxRounds, totalCapacity, obsolescenceRate, initialCash } = req.body;
        const newGame = await Game.create({
            gameCode: gameCode.toUpperCase(),
            maxRounds: maxRounds || 8,
            totalCapacity: totalCapacity || 6000,
            obsolescenceRate: obsolescenceRate || 10,
            initialCash: initialCash || 500000,
            createdBy: req.user._id,
            status: 'active'
        });
        res.status(201).json({ status: 'success', data: { game: newGame } });
    } catch (error) { 
        if (error.code === 11000) {
            const err = new Error('El código de sala ya está en uso. Intente otro.');
            err.status = 400;
            return next(err);
        }
        next(error); 
    }
};

exports.joinGame = async function(req, res, next) {
    try {
        const { gameCode } = req.body;
        const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
        if (!game) {
            const err = new Error('CÓDIGO DE SALA NO ENCONTRADO.');
            err.status = 404;
            return next(err);
        }
        const user = await User.findById(req.user._id);
        let company;
        if (user.companyId) {
            company = await Company.findByIdAndUpdate(user.companyId, { gameId: game._id, ownerEmail: user.email }, { new: true });
        } else {
            const companyName = `Corporación de ${user.email.split('@')[0]}`;
            company = await Company.create({
                name: companyName,
                ownerEmail: user.email,
                cash: game.initialCash,
                techLevel: 1,
                ethicsIndex: 50,
                productionQuota: 0,
                gameId: game._id
            });
            user.companyId = company._id;
            await user.save();
        }
        res.status(200).json({ status: 'success', message: `Vinculado a sala ${gameCode}`, data: { company, gameCode: game.gameCode } });
    } catch (error) { next(error); }
};

// --- FUNCIÓN CRÍTICA DE AVANCE DE RONDA ---
exports.advanceRound = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        
        // 1. Buscar el juego
        const game = await Game.findById(gameId);
        if (!game) {
            const err = new Error('Sala no encontrada en la base de datos.');
            err.status = 404;
            return next(err);
        }
        
        if (game.status === 'finished') {
            const err = new Error('Esta partida ya ha finalizado.');
            err.status = 400;
            return next(err);
        }

        // 2. Avanzar tiempo
        game.currentRound += 1;
        if (game.currentRound > game.maxRounds) game.status = 'finished';
        await game.save();

        // 3. Recalcular Quotas
        const activeCompanies = await Company.find({ gameId: game._id, isBankrupt: false });
        const quota = activeCompanies.length > 0 ? Math.floor(game.totalCapacity / activeCompanies.length) : 0;

        await Company.updateMany({ gameId: game._id, isBankrupt: false }, { $set: { productionQuota: quota } });

        // 4. EMISIÓN SOCKET A LA SALA ESPECÍFICA
        if (global.io) {
            console.log(`[SOCKET] Emitiendo cambio de ronda a sala: ${game.gameCode}`);
            global.io.to(game.gameCode).emit('timeAdvance', { 
                newRound: game.currentRound, 
                newQuota: quota,
                message: `INICIO DE RONDA ${game.currentRound}`
            });
        } else {
            console.warn('[SOCKET] Advertencia: Motor de IO no inicializado.');
        }

        res.status(200).json({ status: 'success', data: { currentRound: game.currentRound } });
    } catch (error) {
        next(error);
    }
};

exports.updateGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const game = await Game.findByIdAndUpdate(gameId, req.body, { new: true });
        if (!game) throw new Error('Sala no encontrada');
        res.status(200).json({ status: 'success', data: { game } });
    } catch (error) { next(error); }
};

exports.deleteGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        await Game.findByIdAndDelete(gameId);
        await Company.updateMany({ gameId: gameId }, { $unset: { gameId: 1 } });
        res.status(200).json({ status: 'success', message: 'Sala eliminada.' });
    } catch (error) { next(error); }
};