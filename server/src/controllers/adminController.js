// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 1.5.0
// DATE: 07-02-2026
// HOUR: 20:25
// PURPOSE: Monitor de competencia con trazabilidad de correos electrónicos.
// CHANGE LOG: Filtrado de empresas por gameId y selección de ownerEmail.
// SPEC REF: Sección 5.2 (Panel de Administración)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const simulationService = require('../services/simulationService');
const Game = require('../models/Game');
const Company = require('../models/Company');

/**
 * Obtiene el estado de la sala activa y el ranking de sus empresas.
 * MODIFICACIÓN: Aislamiento estricto de datos por sala.
 */
exports.getGameStatus = async function(req, res, next) {
    try {
        // 1. Buscamos el juego más reciente creado por este profesor
        const game = await Game.findOne({ createdBy: req.user._id, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        
        let companies = [];
        if (game) {
            // 2. FILTRO DE SEGURIDAD: Solo empresas inscritas en ESTE juego específico
            companies = await Company.find({ gameId: game._id })
                .select('name ownerEmail cash ethicsIndex techLevel isBankrupt')
                .sort('-cash'); // Ranking por capital acumulado
        }

        res.status(200).json({
            status: 'success',
            data: { 
                companies,
                game: game || { currentRound: 0, gameCode: 'SIN SALA ACTIVA' }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ... (Las funciones de processPhase se mantienen llamando a simulationService)
exports.processProcurementPhase = async function(req, res, next) {
    try {
        const game = await Game.findOne({ createdBy: req.user._id, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        const processedCount = await simulationService.processRoundProcurement(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processProductionPhase = async function(req, res, next) {
    try {
        const game = await Game.findOne({ createdBy: req.user._id, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        const processedCount = await simulationService.processRoundProduction(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processLogisticsPhase = async function(req, res, next) {
    try {
        const game = await Game.findOne({ createdBy: req.user._id, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        const processedCount = await simulationService.processRoundLogistics(game.currentRound);
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};

exports.processSalesPhase = async function(req, res, next) {
    try {
        const game = await Game.findOne({ createdBy: req.user._id, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        const processedCount = await simulationService.processRoundSales(game.currentRound);
        if (global.io) {
            global.io.emit('roundProcessed', { round: game.currentRound, message: 'Mercado Cerrado' });
        }
        res.status(200).json({ status: 'success', data: { round: game.currentRound, processedCount } });
    } catch (error) { next(error); }
};