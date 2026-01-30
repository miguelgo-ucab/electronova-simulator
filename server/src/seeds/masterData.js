// ============================================
// FILE: /server/src/seeds/masterData.js
// VERSION: 1.0.0
// DATE: 29-01-2026
// HOUR: 16:00
// PURPOSE: Script para insertar productos y mercados iniciales en la DB.
// CHANGE LOG: Implementacion de datos maestros segun Secciones 2.1 y 2.3.
// SPEC REF: Seccion 2.1 (Productos) y 2.3 (Mercados)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//
const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../models/Product');
const Market = require('../models/Market');
const products = [
{ name: 'Alta', baseProductionCost: 150, formula: { alfa: 70, beta: 30, omega: 0 } },
{ name: 'Media', baseProductionCost: 100, formula: { alfa: 40, beta: 40, omega: 20 } },
{ name: 'Básica', baseProductionCost: 50, formula: { alfa: 0, beta: 50, omega: 50 } }
];
const markets = [
{ name: 'Novaterra', demandPotential: 2000, priceSensitivity: 1.1, priceHardCap: 450, qualityPreference: 0.2 },
{ name: 'Solís', demandPotential: 1500, priceSensitivity: 1.5, priceHardCap: 350, qualityPreference: 0.1 },
{ name: 'Veridia', demandPotential: 1200, priceSensitivity: 0.8, priceHardCap: 600, qualityPreference: 0.5 },
{ name: 'Aurínea', demandPotential: 1800, priceSensitivity: 1.2, priceHardCap: 400, qualityPreference: 0.3 }
];
async function seedDB() {
try {
await mongoose.connect(env.MONGODB_URI);
console.log('[SEED] Conectado para poblar datos...');

// Limpiar datos previos
    await Product.deleteMany({});
    await Market.deleteMany({});

    // Insertar nuevos datos
    await Product.insertMany(products);
    await Market.insertMany(markets);

    console.log('[SEED] Master Data insertada con éxito');
    process.exit(0);
} catch (error) {
    console.error('[SEED] Error crítico: ' + error.message);
    process.exit(1);
}
}
seedDB();
