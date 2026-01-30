// ============================================
// FILE: /server/src/controllers/companyController.js
// VERSION: 1.1.0
// DATE: 29-01-2026
// HOUR: 23:05
// PURPOSE: Gestion de empresas con vinculacion de usuario y auditoria de dueño.
// CHANGE LOG: Actualizacion de getMyCompany para incluir email del dueño.
// SPEC REF: Seccion 2.1 - Entidades y 2.2 - Reglas
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Company = require('../models/Company');
const User = require('../models/User');

/**
 * Crea una nueva empresa para el usuario autenticado.
 * Segun Spec 2.2.C, el capital inicial es de 500,000.
 * Vincula automaticamente el ID de la empresa al perfil del Usuario.
 */
exports.createCompany = async function(req, res, next) {
    try {
        // 1. Verificar si el usuario ya tiene una empresa vinculada
        // req.user viene del middleware authMiddleware.protect
        if (req.user.companyId) {
            const err = new Error('El usuario ya posee una empresa registrada.');
            err.status = 400;
            return next(err);
        }

        // 2. Crear la empresa con los valores por defecto de la Spec
        const newCompany = await Company.create({
            name: req.body.name,
            cash: 500000, // Capital inicial oficial e inalterable desde el cliente
            techLevel: 1,
            ethicsIndex: 50,
            productionQuota: 0 
        });

        // 3. Vincular la empresa al usuario autenticado en la base de datos
        await User.findByIdAndUpdate(req.user._id, { companyId: newCompany._id });

        res.status(201).json({
            status: 'success',
            data: { 
                company: newCompany 
            }
        });
    } catch (error) {
        // Manejo de error por nombre de empresa duplicado
        if (error.code === 11000) {
            error.message = 'Ya existe una empresa con ese nombre en el simulador.';
            error.status = 400;
        }
        next(error);
    }
};

/**
 * Obtiene los datos de la empresa del usuario actual.
 * Incluye validacion de existencia y retorno del email del propietario.
 */
exports.getMyCompany = async function(req, res, next) {
    try {
        // 1. Verificar si el usuario tiene un ID de empresa asignado
        if (!req.user.companyId) {
            const err = new Error('No tienes ninguna empresa vinculada a tu cuenta.');
            err.status = 404;
            return next(err);
        }

        // 2. Buscar la empresa en la base de datos
        const company = await Company.findById(req.user.companyId);
        
        if (!company) {
            const err = new Error('La empresa vinculada no fue encontrada en los registros.');
            err.status = 404;
            return next(err);
        }

        // 3. Respuesta exitosa con datos financieros y de propiedad
        res.status(200).json({
            status: 'success',
            data: { 
                company: company,
                owner: req.user.email 
            }
        });
    } catch (error) {
        next(error);
    }
};