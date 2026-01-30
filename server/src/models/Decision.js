// ============================================
// FILE: /server/src/models/Decision.js
// VERSION: 1.0.0
// DATE: 30-01-2026
// HOUR: 09:45
// PURPOSE: Estructura para almacenar las decisiones de cada empresa por ronda.
// CHANGE LOG: Creacion inicial con soporte para Procurement (Abastecimiento).
// SPEC REF: Seccion 2.1 y 4.2 - Flujo de Procesamiento
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'La decision debe pertenecer a una empresa']
    },
    round: {
        type: Number,
        required: [true, 'Se debe especificar la ronda de la decision'],
        min: 1
    },
    // Seccion 2.2.B: Compras de Materia Prima
    procurement: [{
        material: { type: String, enum: ['Alfa', 'Beta', 'Omega'], required: true },
        quantity: { type: Number, required: true, min: 0 },
        supplier: { type: String, enum: ['local', 'imported'], required: true }
    }],
    // Campos preparados para futuras fases (Produccion, Logistica, Marketing)
    production: [{}],
    logistics: [{}],
    commercial: [{}],
    isProcessed: { type: Boolean, default: false } // Indica si la ronda ya se calculo
}, { timestamps: true });

// Evitar que una empresa tenga dos decisiones para la misma ronda
decisionSchema.index({ companyId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Decision', decisionSchema);