// ============================================
// FILE: /server/src/controllers/companyController.js
// VERSION: 1.2.0
// DATE: 02-02-2026
// HOUR: 11:20
// PURPOSE: Mejora de la consulta de empresa con poblado de datos de juego.
// CHANGE LOG: Implementacion de .populate('gameId') para habilitar rondas dinamicas.
// SPEC REF: Seccion 4.2 - Flujo de Procesamiento
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Company = require('../models/Company');
const User = require('../models/User');

exports.createCompany = async function(req, res, next) {
    try {
        if (req.user.companyId) {
            const err = new Error('El usuario ya posee una empresa registrada.');
            err.status = 400;
            return next(err);
        }

        const newCompany = await Company.create({
            name: req.body.name,
            cash: 500000,
            techLevel: 1,
            ethicsIndex: 50,
            productionQuota: 0 
        });

        await User.findByIdAndUpdate(req.user._id, { companyId: newCompany._id });

        res.status(201).json({
            status: 'success',
            data: { company: newCompany }
        });
    } catch (error) {
        if (error.code === 11000) {
            error.message = 'Ya existe una empresa con ese nombre.';
            error.status = 400;
        }
        next(error);
    }
};

/**
 * Obtiene los datos de la empresa incluyendo la informacion del juego activo.
 * El uso de .populate es vital para que el Frontend vea la Ronda Actual.
 */
exports.getMyCompany = async function(req, res, next) {
    try {
        if (!req.user.companyId) {
            const err = new Error('No tienes ninguna empresa vinculada.');
            err.status = 404;
            return next(err);
        }

        // CAMBIO QUIRURGICO: Se añade .populate('gameId')
        const company = await Company.findById(req.user.companyId).populate('gameId');
        
        if (!company) {
            const err = new Error('La empresa vinculada no existe.');
            err.status = 404;
            return next(err);
        }

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