// ============================================
// FILE: /server/src/models/Game.js
// VERSION: 1.0.0
// DATE: 01-02-2026
// HOUR: 22:30
// PURPOSE: Gestion del estado global de una partida (Rondas y Configuracion).
// CHANGE LOG: Creacion inicial con soporte para capacidad total y ronda actual.
// SPEC REF: Seccion 2.2.A (Capacidad) y 4.1 (Esquemas)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameCode: { type: String, required: true, unique: true, uppercase: true },
    currentRound: { type: Number, default: 1 },
    maxRounds: { type: Number, default: 8 },
    totalCapacity: { type: Number, default: 6000 },
    status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);