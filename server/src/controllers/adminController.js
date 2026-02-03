// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 1.4.1
// DATE: 02-02-2026
// HOUR: 22:45
// PURPOSE: Controlador administrativo dinámico con corrección de visibilidad de sala.
// CHANGE LOG: Ajuste de getActiveGame para soportar estados 'waiting' y 'active'.
// SPEC REF: Sección 5.2 - Panel de Administración
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const simulationService = require('../services/simulationService');
const Game = require('../models/Game');
const Company = require('../models/Company');

/**
 * Función interna de utilidad para obtener la partida actual.
 * MODIFICACIÓN 1.4.1: Busca cualquier partida no finalizada (waiting o active).
 * Garantiza que el administrador vea la sala incluso antes de iniciarla formalmente.
 */
const getActiveGame = async () => {
    const game = await Game.findOne({ status: { $ne: 'finished' } }).sort({ createdAt: -1 });
    if (!game) throw new Error('No se encontró ninguna partida configurada en el sistema.');
    return game;
};

/**
 * Fase 1: Cierre de Abastecimiento.
 */
exports.processProcurementPhase = async function(req, res, next) {
    try {
        const game = await getActiveGame();
        const processedCount = await simulationService.processRoundProcurement(game.currentRound);
        
        res.status(200).json({
            status: 'success',
            message: `Abastecimiento de la Ronda ${game.currentRound} procesado.`,
            data: { round: game.currentRound, companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 2: Cierre de Manufactura.
 */
exports.processProductionPhase = async function(req, res, next) {
    try {
        const game = await getActiveGame();
        const processedCount = await simulationService.processRoundProduction(game.currentRound);
        
        res.status(200).json({
            status: 'success',
            message: `Manufactura de la Ronda ${game.currentRound} procesada.`,
            data: { round: game.currentRound, companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 3: Cierre de Logística.
 */
exports.processLogisticsPhase = async function(req, res, next) {
    try {
        const game = await getActiveGame();
        const processedCount = await simulationService.processRoundLogistics(game.currentRound);

        res.status(200).json({
            status: 'success',
            message: `Logística de la Ronda ${game.currentRound} procesada.`,
            data: { round: game.currentRound, companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 4: Cierre de Mercado (Ventas).
 * GATILLO DE TIEMPO REAL: Notifica a todos los terminales conectados.
 */
exports.processSalesPhase = async function(req, res, next) {
    try {
        const game = await getActiveGame();
        const processedCount = await simulationService.processRoundSales(game.currentRound);

        if (global.io) {
            global.io.emit('roundProcessed', {
                round: game.currentRound,
                timestamp: new Date().toISOString(),
                message: `Mercado de Ronda ${game.currentRound} cerrado. Resultados disponibles.`
            });
        }

        res.status(200).json({
            status: 'success',
            message: `Ventas de la Ronda ${game.currentRound} completadas y notificadas.`,
            data: { round: game.currentRound, companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el estado financiero de todas las empresas y el estado del reloj global.
 * MODIFICACIÓN 1.4.1: Sincronización de búsqueda con getActiveGame para consistencia en UI.
 */
exports.getGameStatus = async function(req, res, next) {
    try {
        const [companies, game] = await Promise.all([
            Company.find().select('name cash ethicsIndex techLevel isBankrupt').sort('-cash'),
            Game.findOne({ status: { $ne: 'finished' } }).sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            status: 'success',
            data: { 
                companies,
                game: game || { currentRound: 0, gameCode: 'SIN PARTIDA' }
            }
        });
    } catch (error) {
        next(error);
    }
};