// ============================================
// FILE: /server/src/models/Company.js
// VERSION: 1.2.0
// DATE: 30-01-2026
// HOUR: 10:30
// PURPOSE: Actualizacion de lotes para soportar materiales en transito.
// CHANGE LOG: Adicion de roundsUntilArrival para logica de Lead Times.
// SPEC REF: Seccion 2.1 - Lote de MP en Transito
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');

const inventoryLotSchema = new mongoose.Schema({
    type: { type: String, enum: ['MP', 'PT'], required: true },
    itemRef: { type: String, required: true }, 
    units: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true },
    ageInRounds: { type: Number, default: 0 },
    // NUEVO: Rondas que faltan para que el material este disponible (Spec 2.2.B)
    roundsUntilArrival: { type: Number, default: 0 }, 
    location: { type: String, default: 'Novaterra' }
});

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    cash: { type: Number, default: 500000 },
    techLevel: { type: Number, default: 1, min: 1 },
    ethicsIndex: { type: Number, default: 50, min: 0, max: 100 },
    productionQuota: { type: Number, default: 0 },
    inventory: [inventoryLotSchema],
    isBankrupt: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);