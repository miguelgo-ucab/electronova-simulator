// ============================================
// FILE: /server/src/models/Company.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 15:00
// PURPOSE: Esquema principal de la empresa, inventarios y finanzas.
// CHANGE LOG: Implementacion de lotes de inventario segun Spec 4.1.
// SPEC REF: Seccion 2.1 - Entidades y Atributos
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//
const mongoose = require('mongoose');
const inventoryLotSchema = new mongoose.Schema({
type: { type: String, enum: ['MP', 'PT'], required: true },
itemRef: { type: String, required: true }, // ID de Producto o Materia Prima
units: { type: Number, required: true, min: 0 },
unitCost: { type: Number, required: true },
ageInRounds: { type: Number, default: 0 },
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
gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' }
}, { timestamps: true });
module.exports = mongoose.model('Company', companySchema);