// ============================================
// FILE: /server/src/middlewares/authMiddleware.js
// VERSION: 1.1.2
// DATE: 30-01-2026
// HOUR: 21:15
// PURPOSE: Mejora de logs de auditoria para roles de usuario.
// CHANGE LOG: Inclusion de console.warn para intentos de acceso no autorizados.
// SPEC REF: Requisitos No Funcionales - Seguridad
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Middleware para proteger rutas. 
 * Verifica que el usuario este logueado mediante el encabezado Authorization.
 */
exports.protect = async function(req, res, next) {
    try {
        let token;

        // 1. Obtener el token del encabezado (Header)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            const err = new Error('No estas autorizado. Por favor inicia sesion.');
            err.status = 401;
            return next(err);
        }

        // 2. Verificar el token (¿Es valido? ¿Ha expirado?)
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // 3. Verificar si el usuario todavia existe en la base de datos
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            const err = new Error('El usuario de este token ya no existe.');
            err.status = 401;
            return next(err);
        }

        // 4. Conceder acceso guardando el usuario en el objeto req
        req.user = currentUser;
        next();
    } catch (error) {
        const err = new Error('Token invalido o expirado.');
        err.status = 401;
        next(err);
    }
};

/**
 * Middleware para restringir acceso segun el Rol.
 * Corregido para mayor trazabilidad en consola.
 */
exports.restrictTo = function(...roles) {
    return function(req, res, next) {
        // Si el rol del usuario no esta en la lista permitida
        if (!roles.includes(req.user.role)) {
            console.warn(`[SECURITY ALERT] Acceso denegado. Usuario: ${req.user.email} | Rol: ${req.user.role} | Requerido: ${roles}`);
            const err = new Error('No tienes permiso para realizar esta accion.');
            err.status = 403;
            return next(err);
        }
        next();
    };
};
