// ============================================
// FILE: /server/src/controllers/adminController.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 11:15
// PURPOSE: Controlador para acciones exclusivas del administrador/docente.
// CHANGE LOG: Implementacion de trigger para procesamiento de ronda.
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const simulationService = require('../services/simulationService');

/**
 * Ejecuta el cierre de la fase de abastecimiento para todos los jugadores.
 * Esta accion es irreversible para la ronda actual.
 */
exports.processProcurementPhase = async function(req, res, next) {
    try {
        const { round } = req.body;

        if (!round) {
            const err = new Error('Debe especificar la ronda a procesar.');
            err.status = 400;
            return next(err);
        }

        // Llamada al motor de simulacion
        const processedCount = await simulationService.processRoundProcurement(round);

        res.status(200).json({
            status: 'success',
            message: 'Fase de abastecimiento procesada correctamente.',
            data: {
                round: round,
                companiesProcessed: processedCount
            }
        });
    } catch (error) {
        next(error);
    }
};