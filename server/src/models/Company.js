// ============================================
// FILE: /server/src/models/Company.js
// VERSION: 1.3.0
// DATE: 01-02-2026
// HOUR: 23:05
// PURPOSE: Esquema de empresa con vinculacion obligatoria a partida.
// CHANGE LOG: Aseguramiento del campo gameId para gestion de salas.
// SPEC REF: Seccion 2.1 - Entidades
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
    isBankrupt: { type: Boolean, default: false },
    // CAMPO CRITICO PARA LA VINCULACION
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);