// ============================================
// FILE: /server/src/models/Product.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 15:10
// PURPOSE: Definicion de gamas de productos y formulas de fabricacion.
// CHANGE LOG: Creacion inicial con formulas fijas segun Spec 2.1.
// SPEC REF: Seccion 2.1 - Productos
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        enum: ['Alta', 'Media', 'Básica'] 
    },
    baseProductionCost: { type: Number, required: true },
    formula: {
        alfa: { type: Number, default: 0 },
        beta: { type: Number, default: 0 },
        omega: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('Product', productSchema);