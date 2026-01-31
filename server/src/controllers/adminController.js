// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 1.2.0
// DATE: 30-01-2026
// HOUR: 22:20
// PURPOSE: Triggers administrativos para las fases de operacion del simulador.
// CHANGE LOG: Adicion de processLogisticsPhase para el despacho de mercancias.
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const simulationService = require('../services/simulationService');

/**
 * Fase 1: Cierre de Abastecimiento (Compra de Materia Prima)
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
 */
exports.processLogisticsPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        // Llamamos al servicio que mueve la mercancia y cobra fletes
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
 */
exports.processSalesPhase = async function(req, res, next) {
    try {
        const { round } = req.body;
        const processedCount = await simulationService.processRoundSales(round);

        res.status(200).json({
            status: 'success',
            message: 'Simulacion de mercado completada. Ventas registradas.',
            data: { companiesProcessed: processedCount }
        });
    } catch (error) {
        next(error);
    }
};