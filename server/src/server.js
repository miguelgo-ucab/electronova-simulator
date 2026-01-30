// ============================================
// FILE: /server/src/server.js
// VERSION: 1.2.0
// DATE: 29-01-2026
// HOUR: 14:00
// PURPOSE: Punto de entrada con manejo de base de datos limpio.
// CHANGE LOG: Sintaxis simplificada para evitar errores de validacion.
// SPEC REF: Seccion 3.1 - Arquitectura
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//
const mongoose = require('mongoose');
const app = require('./app');
const env = require('./config/env');
const dbOptions = {
autoIndex: true,
connectTimeoutMS: 10000,
socketTimeoutMS: 45000,
maxPoolSize: 10
};
mongoose.connect(env.MONGODB_URI, dbOptions)
.then(function() {
console.log('DB CONECTADA');
})
.catch(function(err) {
console.log('DB ERROR: ' + err.message);
process.exit(1);
});
app.listen(env.PORT, function() {
console.log('SERVER LISTO EN PUERTO: ' + env.PORT);
});