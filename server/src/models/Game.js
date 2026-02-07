// ============================================
// FILE: /server/src/models/Game.js
// VERSION: 1.1.0
// DATE: 07-02-2026
// HOUR: 11:00
// PURPOSE: Esquema extendido con parametros configurables por el docente.
// CHANGE LOG: Inclusion de cash inicial y tasa de obsolescencia.
// SPEC REF: Seccion 4.1 - GameSettings Schema
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'active' },
    currentRound: { type: Number, default: 1 },
    
    // CONFIGURACIÓN DE LA PARTIDA (Game Settings)
    maxRounds: { type: Number, default: 8, min: 1, max: 20 },
    totalCapacity: { type: Number, default: 6000, min: 1000 },
    obsolescenceRate: { type: Number, default: 10, min: 0, max: 100 }, // %
    initialCash: { type: Number, default: 500000, min: 10000 },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);