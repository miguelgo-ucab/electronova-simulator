// ============================================
// FILE: /server/src/config/env.js
// VERSION: 1.2.0
// DATE: 29-01-2026
// HOUR: 13:50
// PURPOSE: Validacion de entorno con sintaxis ultra-compatible.
// CHANGE LOG: Uso de funciones tradicionales para evitar errores de parser.
// SPEC REF: Requisito No Funcional - Seguridad
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//
const dotenv = require('dotenv');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
dotenv.config({ path: path.join(__dirname, '../../.env') });
}
const env = {
NODE_ENV: process.env.NODE_ENV || 'development',
PORT: parseInt(process.env.PORT, 10) || 5000,
MONGODB_URI: process.env.MONGODB_URI,
JWT_SECRET: process.env.JWT_SECRET,
CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvs.forEach(function(key) {
if (!env[key]) {
throw new Error('FATAL: Variable obligatoria faltante: ' + key);
}
});
module.exports = env;