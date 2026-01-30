// ============================================
// FILE: /server/src/controllers/authController.js
// VERSION: 1.1.0
// DATE: 29-01-2026
// HOUR: 18:45
// PURPOSE: Controlador de autenticacion corregido para Express 5.
// CHANGE LOG: Inclusion de parametro 'next' y manejo de errores profesional.
// SPEC REF: Seccion 5 - Endpoints REST
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Generador de Token
const signToken = function(id) {
    return jwt.sign({ id: id }, env.JWT_SECRET, { expiresIn: '24h' });
};

// REGISTRO (SIGNUP)
exports.signup = async function(req, res, next) {
    try {
        const { email, password, role } = req.body;

        // Crear usuario
        const newUser = await User.create({
            email: email,
            password: password,
            role: role || 'student'
        });

        const token = signToken(newUser._id);

        // Limpiar respuesta
        newUser.password = undefined;

        res.status(201).json({
            status: 'success',
            token: token,
            data: { user: newUser }
        });
    } catch (error) {
        // Enviar al manejador de errores de app.js
        // Si el error es por duplicado (E11000), cambiamos el mensaje
        if (error.code === 11000) {
            error.message = 'El correo electronico ya esta registrado.';
            error.status = 400;
        }
        next(error); 
    }
};

// LOGIN
exports.login = async function(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const err = new Error('Por favor proporcione email y contraseña');
            err.status = 400;
            return next(err);
        }

        const user = await User.findOne({ email: email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            const err = new Error('Email o contraseña incorrectos');
            err.status = 401;
            return next(err);
        }

        const token = signToken(user._id);
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token: token,
            data: { user: user }
        });
    } catch (error) {
        next(error);
    }
};