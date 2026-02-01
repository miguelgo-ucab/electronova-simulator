// ============================================
// FILE: /server/src/controllers/marketController.js
// VERSION: 1.0.1
// DATE: 01-02-2026
// HOUR: 16:40
// PURPOSE: Controlador de mercados con manejo de errores robusto.
// CHANGE LOG: Verificación de existencia del modelo Market.
// SPEC REF: Sección 2.3 - Motor de Mercado
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const Market = require('../models/Market');

exports.getAllMarkets = async function(req, res, next) {
    try {
        const markets = await Market.find();
        
        // Rigor: Si no hay mercados, avisar al sistema
        if (!markets || markets.length === 0) {
            const err = new Error('No se encontraron mercados en la base de datos.');
            err.status = 404;
            return next(err);
        }

        res.status(200).json({
            status: 'success',
            data: { data: markets }
        });
    } catch (error) {
        next(error);
    }
};