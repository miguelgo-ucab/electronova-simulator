// ============================================
// FILE: /server/src/controllers/decisionController.js
// VERSION: 1.4.0
// DATE: 30-01-2026
// HOUR: 22:50
// PURPOSE: Validacion de Hard Cap de precios en decisiones comerciales.
// CHANGE LOG: Integracion de validacion de precios contra la Spec 2.3.
// SPEC REF: Seccion 2.3 - Regla de Hard Cap
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Decision = require('../models/Decision');
const Company = require('../models/Company');
const Market = require('../models/Market');

exports.saveDecision = async function(req, res, next) {
    try {
        const { round, procurement, production, logistics, commercial } = req.body;
        const companyId = req.user.companyId;

        const company = await Company.findById(companyId);
        if (!company) throw new Error('Empresa no encontrada');

        // 1. VALIDACION COMERCIAL (Hard Cap)
        if (commercial && commercial.length > 0) {
            const allMarkets = await Market.find();
            for (let comm of commercial) {
                const marketSpec = allMarkets.find(m => m.name === comm.marketName);
                if (marketSpec && comm.price > marketSpec.priceHardCap) {
                    const err = new Error(`El precio en ${comm.marketName} excede el Hard Cap de $${marketSpec.priceHardCap}`);
                    err.status = 400;
                    return next(err);
                }
            }
        }

        // 2. PERSISTENCIA
        const decision = await Decision.findOneAndUpdate(
            { companyId, round },
            { procurement, production, logistics, commercial, isProcessed: false },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            message: 'Estrategia integral guardada exitosamente.',
            data: { decision }
        });
    } catch (error) {
        next(error);
    }
};