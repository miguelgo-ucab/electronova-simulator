// ============================================
// FILE: /server/src/models/Decision.js
// VERSION: 1.1.0
// DATE: 30-01-2026
// HOUR: 22:40
// PURPOSE: Soporte para decisiones comerciales (Precios y Marketing).
// CHANGE LOG: Definicion de esquema commercial segun Spec 2.3.
// SPEC REF: Seccion 2.3 - Motor de Mercado
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    round: { type: Number, required: true },
    procurement: [{
        material: String,
        quantity: Number,
        supplier: String
    }],
    production: [{
        productName: String,
        quantity: Number
    }],
    logistics: [{
        productName: String,
        destination: String,
        quantity: Number,
        method: String
    }],
    // NUEVO: Seccion Comercial (Precios por Plaza y Marketing)
    commercial: [{
        marketName: { type: String, required: true },
        productName: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        marketingInvestment: { type: Number, default: 0, min: 0 }
    }],
    isProcessed: { type: Boolean, default: false }
}, { timestamps: true });

decisionSchema.index({ companyId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Decision', decisionSchema);