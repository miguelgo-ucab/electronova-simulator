// ============================================
// FILE: /server/src/controllers/decisionController.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 10:00
// PURPOSE: Manejo de la creacion y validacion de decisiones de abastecimiento.
// CHANGE LOG: Implementacion de validacion de fondos y calculo de costos de MP.
// SPEC REF: Seccion 2.2.B - Sistema de Compras de Materia Prima
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Decision = require('../models/Decision');
const Company = require('../models/Company');

/**
 * Registra una decision de compra de materia prima.
 * Valida que la empresa tenga fondos suficientes antes de guardar.
 */
exports.saveProcurementDecision = async function(req, res, next) {
    try {
        const { round, procurement } = req.body;
        const companyId = req.user.companyId;

        // 1. Verificar existencia de la empresa
        const company = await Company.findById(companyId);
        if (!company) {
            const err = new Error('Empresa no encontrada.');
            err.status = 404;
            return next(err);
        }

        // 2. Definir costos base segun Spec 2.2.B (Ejemplo: Alfa $15)
        // Nota: En una fase avanzada, estos vendran de la DB.
        const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };
        let totalCost = 0;

        // 3. Calcular costo total de la orden
        procurement.forEach(item => {
            let itemCost = baseCosts[item.material] * item.quantity;
            // Si es local, aplicar recargo del 20% (Spec 2.2.B)
            if (item.supplier === 'local') {
                itemCost *= 1.2;
            }
            totalCost += itemCost;
        });

        // 4. Validar fondos (Rigor Financiero)
        if (company.cash < totalCost) {
            const err = new Error('Fondos insuficientes. Costo: $' + totalCost + ' | Disponible: $' + company.cash);
            err.status = 400;
            return next(err);
        }

        // 5. Crear o actualizar la decision para esta ronda
        const decision = await Decision.findOneAndUpdate(
            { companyId, round },
            { procurement, isProcessed: false },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            message: 'Decision de abastecimiento guardada exitosamente.',
            data: { 
                totalEstimatedCost: totalCost,
                decision: decision 
            }
        });
    } catch (error) {
        next(error);
    }
};