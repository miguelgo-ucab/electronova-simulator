// ============================================
// FILE: /server/src/controllers/gameController.js
// VERSION: 1.7.0
// DATE: 07-02-2026
// HOUR: 20:20
// PURPOSE: Gestión de salas con aislamiento de profesor y auto-fundación de empresas.
// CHANGE LOG: Implementación de filtrado por creador y asignación automática de nombres.
// SPEC REF: Sección 3.2 (Gestión de Partidas)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

const Game = require('../models/Game');
const Company = require('../models/Company');
const User = require('../models/User');

/**
 * Obtiene las salas creadas exclusivamente por el profesor autenticado.
 * Garantiza que cada docente gestione su propio entorno de simulación.
 */
exports.getAllGames = async function(req, res, next) {
    try {
        // Filtramos por el ID del usuario que hace la petición (req.user._id)
        const games = await Game.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            status: 'success',
            data: { games }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crea una nueva sala de simulación con parámetros personalizados.
 */
exports.createGame = async function(req, res, next) {
    try {
        const { gameCode, maxRounds, totalCapacity, obsolescenceRate, initialCash } = req.body;
        
        const newGame = await Game.create({
            gameCode: gameCode.toUpperCase(),
            maxRounds: maxRounds || 8,
            totalCapacity: totalCapacity || 6000,
            obsolescenceRate: obsolescenceRate || 10,
            initialCash: initialCash || 500000,
            createdBy: req.user._id, // Vinculamos la sala al profesor
            status: 'active'
        });

        res.status(201).json({
            status: 'success',
            data: { game: newGame }
        });
    } catch (error) {
        if (error.code === 11000) {
            const err = new Error('El código de sala ya está en uso por otro profesor.');
            err.status = 400;
            return next(err);
        }
        next(error);
    }
};

/**
 * Vinculación inteligente de Estudiante a Sala:
 * 1. Valida la existencia del código de sala.
 * 2. Si el estudiante no tiene empresa, se funda una automáticamente.
 * 3. Asigna el nombre de la empresa basado en la identidad del estudiante.
 */
exports.joinGame = async function(req, res, next) {
    try {
        const { gameCode } = req.body;
        
        // Buscar la sala en la base de datos
        const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
        if (!game) {
            const err = new Error('CÓDIGO DE SALA INVÁLIDO O INEXISTENTE.');
            err.status = 404;
            return next(err);
        }

        // Recuperar datos frescos del usuario
        const user = await User.findById(req.user._id);
        let company;

        if (user.companyId) {
            // Caso A: El estudiante ya tiene una empresa, la movemos a esta sala
            company = await Company.findByIdAndUpdate(
                user.companyId,
                { gameId: game._id, ownerEmail: user.email },
                { new: true }
            );
        } else {
            // Caso B: ASIGNACIÓN AUTOMÁTICA DE NOMBRE (Auto-Founding)
            // Extraemos el nombre del email (ej: alumno123@gmail.com -> Corporación de alumno123)
            const studentIdentifier = user.email.split('@')[0];
            const companyName = `Corporación de ${studentIdentifier}`;
            
            company = await Company.create({
                name: companyName,
                ownerEmail: user.email, // Trazabilidad para el profesor
                cash: game.initialCash,
                techLevel: 1,
                ethicsIndex: 50,
                productionQuota: 0,
                gameId: game._id
            });

            // Actualizamos el perfil del usuario con su nueva empresa
            user.companyId = company._id;
            await user.save();
        }

        res.status(200).json({
            status: 'success',
            message: `Acceso concedido a la sala ${gameCode}`,
            data: { company }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Avanza el reloj global de la simulación y reparte la capacidad de planta.
 */
exports.advanceRound = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);
        if (!game || game.status === 'finished') throw new Error('Partida no disponible.');

        game.currentRound += 1;
        if (game.currentRound > game.maxRounds) game.status = 'finished';
        await game.save();

        // Recálculo de Quota: Capacidad Total / Empresas Activas
        const activeCompanies = await Company.find({ gameId: game._id, isBankrupt: false });
        const quota = activeCompanies.length > 0 ? Math.floor(game.totalCapacity / activeCompanies.length) : 0;

        await Company.updateMany({ gameId: game._id, isBankrupt: false }, { $set: { productionQuota: quota } });

        if (global.io) {
            global.io.emit('timeAdvance', { newRound: game.currentRound, newQuota: quota });
        }

        res.status(200).json({ status: 'success', data: { currentRound: game.currentRound } });
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina una sala y desvincula a las empresas participantes.
 */
exports.deleteGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        await Game.findByIdAndDelete(gameId);
        await Company.updateMany({ gameId: gameId }, { $unset: { gameId: 1 } });
        res.status(200).json({ status: 'success', message: 'Sala eliminada correctamente.' });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualiza parámetros de una sala existente.
 */
exports.updateGame = async function(req, res, next) {
    try {
        const { gameId } = req.params;
        const game = await Game.findByIdAndUpdate(gameId, req.body, { new: true });
        if (!game) throw new Error('Sala no encontrada');
        res.status(200).json({ status: 'success', data: { game } });
    } catch (error) {
        next(error);
    }
};