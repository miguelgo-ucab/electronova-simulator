// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 2.0.0
// DATE: 08-02-2026
// HOUR: 07:25
// PURPOSE: Controlador administrativo con soporte para gestión específica por ID.
// CHANGE LOG: Reemplazo de getActiveGame por búsqueda directa mediante gameId.
// SPEC REF: Sección 5.2 - Panel de Administración
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const simulationService = require('../services/simulationService');
const Game = require('../models/Game');
const Company = require('../models/Company');

/**
 * Helper para validar la sala específica que se quiere controlar.
 */
const getTargetGame = async (gameId) => {
    if (!gameId) throw new Error('ID de sala no proporcionado.');
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Sala no encontrada.');
    return game;
};

// --- FASES DE PROCESAMIENTO ---
// Ahora todas reciben gameId desde el cuerpo de la petición

exports.processProcurementPhase = async function(req, res, next) {
    try {
        const game = await getTargetGame(req.body.gameId);
        const processedCount = await simulationService.processRoundProcurement(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processProductionPhase = async function(req, res, next) {
    try {
        const game = await getTargetGame(req.body.gameId);
        const processedCount = await simulationService.processRoundProduction(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processLogisticsPhase = async function(req, res, next) {
    try {
        const game = await getTargetGame(req.body.gameId);
        const processedCount = await simulationService.processRoundLogistics(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processSalesPhase = async function(req, res, next) {
    try {
        const game = await getTargetGame(req.body.gameId);
        const processedCount = await simulationService.processRoundSales(game.currentRound);

        if (global.io) {
            // CAMBIO CRÍTICO: Emitir SOLO a la sala específica
            global.io.to(game.gameCode).emit('roundProcessed', {
                round: game.currentRound,
                timestamp: new Date().toISOString(),
                message: `Mercado de Ronda ${game.currentRound} cerrado.`
            });
            console.log(`[SOCKET] Notificación enviada a sala: ${game.gameCode}`);
        }

        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

/**
 * Obtiene el estado de UNA sala específica basada en el query param ?gameId=...
 */
exports.getGameStatus = async function(req, res, next) {
    try {
        const { gameId } = req.query;
        if (!gameId) throw new Error('ID de sala requerido.');

        const game = await Game.findById(gameId);
        let companies = [];
        
        if (game) {
            companies = await Company.find({ gameId: game._id })
                .select('name ownerEmail cash ethicsIndex techLevel isBankrupt')
                .sort('-cash');
        }

        res.status(200).json({
            status: 'success',
            data: { companies, game }
        });
    } catch (error) {
        next(error);
    }
};