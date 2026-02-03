// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 1.3.0
// DATE: 01-02-2026
// HOUR: 20:50
// PURPOSE: Triggers administrativos con notificaciones en tiempo real (Socket.IO).
// CHANGE LOG: Integracion de gatillos de notificacion en la fase de ventas.
// SPEC REF: Seccion 4.2 (Flujo de Procesamiento) y 3.5 (WebSockets)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const simulationService = require('../services/simulationService');

/**
 * Fase 1: Cierre de Abastecimiento (Compra de Materia Prima)
 * Procesa las ordenes de compra y crea lotes en transito.
 */
exports.processProcurementPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        if (!round) {
            const err = new Error('Debe especificar la ronda a procesar.');
            err.status = 400;
            return next(err);
        }
        const processedCount = await simulationService.processRoundProcurement(round);
        res.status(200).json({
            status: 'success',
            message: 'Fase de abastecimiento procesada correctamente.',
            data: { round, companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 2: Cierre de Manufactura (Transformacion de MP a PT)
 * Consume materia prima disponible y genera producto terminado en fabrica.
 */
exports.processProductionPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        const processedCount = await simulationService.processRoundProduction(round);
        res.status(200).json({
            status: 'success',
            message: 'Fase de manufactura procesada correctamente.',
            data: { companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 3: Cierre de Logistica (Distribucion a Plazas de Venta)
 * Mueve el PT de fabrica a las plazas comerciales elegidas por el jugador.
 */
exports.processLogisticsPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        const processedCount = await simulationService.processRoundLogistics(round);

        res.status(200).json({
            status: 'success',
            message: 'Fase de logistica y despacho procesada correctamente.',
            data: { companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fase 4: Cierre de Mercado (Ventas Finales y Contabilidad)
 * GATILLO DE TIEMPO REAL: Notifica a todos los clientes conectados.
 */
exports.processSalesPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        if (!round) {
            const err = new Error('Ronda no especificada para el cierre de ventas.');
            err.status = 400;
            return next(err);
        }

        // 1. Ejecutar el motor de mercado ECPCIM
        const processedCount = await simulationService.processRoundSales(round);

        // 2. EMISION EN TIEMPO REAL (Gatillo de Notificacion)
        // Verificamos si el objeto global io esta disponible
        if (global.io) {
            global.io.emit('roundProcessed', {
                round: round,
                timestamp: new Date().toISOString(),
                message: '¡La simulacion de mercado ha finalizado! Revise su Dashboard.'
            });
            console.log(`[SOCKET] Notificacion de ronda ${round} enviada a todos los terminales.`);
        }

        // 3. Respuesta a la peticion administrativa
        res.status(200).json({
            status: 'success',
            message: 'Simulacion de mercado completada y notificada en tiempo real.',
            data: { 
                round, 
                companiesProcessed: processedCount 
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el estado financiero de todas las empresas vinculadas a un juego.
 */
exports.getGameStatus = async function(req, res, next) {
    try {
        // Buscamos todas las empresas y traemos sus datos clave
        const companies = await Company.find()
            .select('name cash ethicsIndex techLevel isBankrupt')
            .sort('-cash'); // Ordenar por mayor capital (Ranking)

        res.status(200).json({
            status: 'success',
            data: { companies }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el estado financiero de todas las empresas vinculadas a un juego.
 */
exports.getGameStatus = async function(req, res, next) {
    try {
        // Buscamos todas las empresas y traemos sus datos clave
        const companies = await Company.find()
            .select('name cash ethicsIndex techLevel isBankrupt')
            .sort('-cash'); // Ordenar por mayor capital (Ranking)

        res.status(200).json({
            status: 'success',
            data: { companies }
        });
    } catch (error) {
        next(error);
    }
};