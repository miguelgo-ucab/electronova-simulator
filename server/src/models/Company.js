// ============================================
// FILE: /server/src/models/Company.js
// VERSION: 1.4.0
// DATE: 07-02-2026
// HOUR: 17:50
// PURPOSE: Esquema de empresa con trazabilidad de propietario (Email).
// CHANGE LOG: Inclusión de campo ownerEmail para reportes docentes.
// SPEC REF: Requisito P.2 - Reportes de Profesor
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const mongoose = require('mongoose');

const inventoryLotSchema = new mongoose.Schema({
    type: { type: String, enum: ['MP', 'PT'], required: true },
    itemRef: { type: String, required: true }, 
    units: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true },
    ageInRounds: { type: Number, default: 0 },
    roundsUntilArrival: { type: Number, default: 0 }, 
    location: { type: String, default: 'Novaterra' }
});

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    // CAMPO NUEVO PARA REPORTE:
    ownerEmail: { type: String, required: true }, 
    cash: { type: Number, default: 500000 },
    techLevel: { type: Number, default: 1, min: 1 },
    ethicsIndex: { type: Number, default: 50, min: 0, max: 100 },
    productionQuota: { type: Number, default: 0 },
    inventory: [inventoryLotSchema],
    isBankrupt: { type: Boolean, default: false },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);