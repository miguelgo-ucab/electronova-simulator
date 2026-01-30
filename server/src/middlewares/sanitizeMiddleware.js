// ============================================
// FILE: /server/src/middlewares/sanitizeMiddleware.js
// VERSION: 1.1.0
// DATE: 29-01-2026
// HOUR: 18:00
// PURPOSE: Sanitizacion segura compatible con Express 5.
// CHANGE LOG: Eliminada manipulacion de req.query para evitar error 'next is not a function'.
// SPEC REF: Requisitos No Funcional - Seguridad (OWASP)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const sanitize = require('mongo-sanitize');

/**
 * Limpia el cuerpo de la peticion (req.body) y los parametros de URL (req.params).
 * No toca req.query en Express 5 para evitar corrupcion del objeto IncomingMessage.
 */
module.exports = function(req, res, next) {
    // Sanitizar el body es lo mas critico para prevenir inyecciones en Login/Signup
    if (req.body) {
        req.body = sanitize(req.body);
    }
    
    // Sanitizar parametros de ruta (ej. /api/users/:id)
    if (req.params) {
        req.params = sanitize(req.params);
    }

    // Continuar al siguiente middleware/controlador
    next();
};