// ============================================
// FILE: /server/src/services/simulationService.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 10:45
// PURPOSE: Motor de procesamiento de rondas y logica de transito.
// CHANGE LOG: Implementacion de processProcurement con Lead Times y costos.
// SPEC REF: Seccion 2.2.B y 4.2 - Flujo de Procesamiento
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Company = require('../models/Company');
const Decision = require('../models/Decision');

/**
 * Procesa todas las decisiones de abastecimiento de una ronda.
 * Resta el dinero y crea los lotes en el inventario con su tiempo de espera.
 */
exports.processRoundProcurement = async function(round) {
    const decisions = await Decision.find({ round: round, isProcessed: false });
    const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };

    for (const dec of decisions) {
        const company = await Company.findById(dec.companyId);
        if (!company) continue;

        let totalOrderCost = 0;

        dec.procurement.forEach(item => {
            let unitCost = baseCosts[item.material];
            if (item.supplier === 'local') unitCost *= 1.2;
            
            const itemTotal = unitCost * item.quantity;
            totalOrderCost += itemTotal;

            // Crear el lote en el inventario de la empresa
            company.inventory.push({
                type: 'MP',
                itemRef: item.material,
                units: item.quantity,
                unitCost: unitCost,
                // Spec 2.2.B: Local 1 ronda, Importado 2 rondas
                roundsUntilArrival: item.supplier === 'local' ? 1 : 2
            });

            // Spec 2.2.B: Impacto etico por compra local (+5 pts)
            if (item.supplier === 'local') {
                company.ethicsIndex = Math.min(100, company.ethicsIndex + 5);
            }
        });

        // Restar el efectivo de la empresa
        company.cash -= totalOrderCost;
        await company.save();

        // Marcar la decision como procesada
        dec.isProcessed = true;
        await dec.save();
    }
    
    return decisions.length;
};