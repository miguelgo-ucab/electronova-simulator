// ============================================
// FILE: /server/src/models/Market.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 15:20
// PURPOSE: Parametros de las plazas comerciales (Demanda y Sensibilidad).
// CHANGE LOG: Implementacion de HardCap y Elasticidad segun Spec 2.3.
// SPEC REF: Seccion 2.3 - Motor de Mercado
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//
const mongoose = require('mongoose');
const marketSchema = new mongoose.Schema({
name: {
type: String,
required: true,
enum: ['Novaterra', 'Solís', 'Veridia', 'Aurínea']
},
demandPotential: { type: Number, required: true },
priceSensitivity: { type: Number, default: 1.2 },
priceHardCap: { type: Number, required: true },
qualityPreference: { type: Number, default: 0.3 }
});
module.exports = mongoose.model('Market', marketSchema);