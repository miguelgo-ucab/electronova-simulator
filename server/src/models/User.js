// ============================================
// FILE: /server/src/models/User.js
// VERSION: 1.1.0
// DATE: 29-01-2026
// HOUR: 17:30
// PURPOSE: Modelo de usuario corregido para Mongoose 9.x (Async Middleware).
// CHANGE LOG: Eliminacion de callback 'next' en pre-save para evitar TypeError.
// SPEC REF: Requisitos Extraidos - Seccion 4 (User Model)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    }
}, { timestamps: true });

// Middleware pre-save: Sintaxis moderna para Mongoose 9 (Sin next)
userSchema.pre('save', async function() {
    // Si la contraseña no ha cambiado, terminar la funcion
    if (!this.isModified('password')) {
        return;
    }

    // Cifrar la contraseña
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Error al cifrar la contraseña: ' + error.message);
    }
});

// Metodo para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);