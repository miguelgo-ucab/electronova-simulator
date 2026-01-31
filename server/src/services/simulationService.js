// ============================================
// FILE: /server/src/services/simulationService.js
// VERSION: 1.3.0
// DATE: 31-01-2026
// HOUR: 04:40
// PURPOSE: Implementacion del motor de ventas basado en el algoritmo ECPCIM.
// CHANGE LOG: Adicion de processRoundSales con elasticidad y consumo de PT.
// SPEC REF: Seccion 2.3 - Motor de Mercado Hibrido
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

const Market = require('../models/Market');
const Company = require('../models/Company');
const Decision = require('../models/Decision');
const Product = require('../models/Product');

/**
 * Procesa todas las decisiones de abastecimiento de una ronda.
 * Resta el dinero y crea los lotes en el inventario con su tiempo de espera.
 */
exports.processRoundProcurement = async function(round) {
    const decisions = await Decision.find({ round: round, isProcessed: false });
    const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };

    for (const dec of decisions) {
        const company = await Company.findById(dec.companyId);
        if (!company) continue;

        let totalOrderCost = 0;

        dec.procurement.forEach(item => {
            let unitCost = baseCosts[item.material];
            if (item.supplier === 'local') unitCost *= 1.2;
            
            const itemTotal = unitCost * item.quantity;
            totalOrderCost += itemTotal;

            // Crear el lote en el inventario de la empresa
            company.inventory.push({
                type: 'MP',
                itemRef: item.material,
                units: item.quantity,
                unitCost: unitCost,
                // Spec 2.2.B: Local 1 ronda, Importado 2 rondas
                roundsUntilArrival: item.supplier === 'local' ? 1 : 2
            });

            // Spec 2.2.B: Impacto etico por compra local (+5 pts)
            if (item.supplier === 'local') {
                company.ethicsIndex = Math.min(100, company.ethicsIndex + 5);
            }
        });

        // Restar el efectivo de la empresa
        company.cash -= totalOrderCost;
        await company.save();

        // Marcar la decision como procesada
        dec.isProcessed = true;
        await dec.save();
    }
    
    return decisions.length;
};

/**
 * Procesa la fase de manufactura. 
 * Transforma MP disponible en PT y resta costos de operacion.
 */
exports.processRoundProduction = async function(round) {
    const decisions = await Decision.find({ round: round, isProcessed: false }).populate('companyId');
    const allProducts = await Product.find(); // Cargar formulas (Alta, Media, Basica)

    for (const dec of decisions) {
        const company = await Company.findById(dec.companyId);
        if (!company) continue;

        for (const plan of dec.production) {
            const productSpec = allProducts.find(p => p.name === plan.productName);
            if (!productSpec) continue;

            // 1. Calcular necesidad de materiales (Spec 2.1)
            // Ejemplo: 500 unidades de Alta -> 500 * 0.70 = 350 unidades de Alfa
            const reqAlfa = (plan.quantity * productSpec.formula.alfa) / 100;
            const reqBeta = (plan.quantity * productSpec.formula.beta) / 100;
            const reqOmega = (plan.quantity * productSpec.formula.omega) / 100;

            // 2. Verificar Stock Disponible (roundsUntilArrival === 0)
            const getStock = (ref) => company.inventory
                .filter(i => i.itemRef === ref && i.type === 'MP' && i.roundsUntilArrival === 0)
                .reduce((acc, i) => acc + i.units, 0);

            if (getStock('Alfa') < reqAlfa || getStock('Beta') < reqBeta || getStock('Omega') < reqOmega) {
                console.warn(`[SIM] Empresa ${company.name} no tiene suficiente MP para producir ${plan.productName}`);
                continue; // En un simulador real, esto generaria una alerta al usuario
            }

            // 3. Consumir MP (Rigor: Se resta del inventario)
            const consumeMP = (ref, amount) => {
                let remaining = amount;
                for (let lot of company.inventory) {
                    if (lot.itemRef === ref && lot.type === 'MP' && lot.roundsUntilArrival === 0 && remaining > 0) {
                        const take = Math.min(lot.units, remaining);
                        lot.units -= take;
                        remaining -= take;
                    }
                }
            };
            consumeMP('Alfa', reqAlfa);
            consumeMP('Beta', reqBeta);
            consumeMP('Omega', reqOmega);

            // 4. Crear Producto Terminado (PT)
            company.inventory.push({
                type: 'PT',
                itemRef: plan.productName,
                units: plan.quantity,
                unitCost: productSpec.baseProductionCost,
                roundsUntilArrival: 0, // El PT fabricado esta disponible de inmediato
                location: 'Novaterra' // Siempre se fabrica en la sede
            });

            // 5. Cobrar Costo de Manufactura (Spec 2.1)
            company.cash -= (plan.quantity * productSpec.baseProductionCost);
        }

        await company.save();
    }
    return decisions.length;
};

/**
 * Procesa la fase de logistica.
 * Mueve PT de la fabrica a las plazas y cobra el flete.
 */
exports.processRoundLogistics = async function(round) {
    const decisions = await Decision.find({ round: round, isProcessed: false });
    
    // Costos de envio por unidad (Simulacion de tarifas)
    const rates = { Terrestre: 5, Aereo: 15 };

    for (const dec of decisions) {
        const company = await Company.findById(dec.companyId);
        if (!company || !dec.logistics) continue;

        let totalFreightCost = 0;

        for (const ship of dec.logistics) {
            const cost = ship.quantity * rates[ship.method];
            totalFreightCost += cost;

            // Restar de la fabrica (Novaterra)
            let remaining = ship.quantity;
            for (let lot of company.inventory) {
                if (lot.type === 'PT' && lot.itemRef === ship.productName && lot.location === 'Novaterra' && remaining > 0) {
                    const take = Math.min(lot.units, remaining);
                    lot.units -= take;
                    remaining -= take;
                }
            }

            // Crear el lote en el destino o en transito
            company.inventory.push({
                type: 'PT',
                itemRef: ship.productName,
                units: ship.quantity,
                unitCost: 0, // El costo de manufactura ya se registro
                location: ship.destination,
                // Si es Aereo llega en 0 rondas, Terrestre en 1 ronda (Spec 2.2)
                roundsUntilArrival: ship.method === 'Aereo' ? 0 : 1
            });
        }

        company.cash -= totalFreightCost;
        await company.save();
    }
    return decisions.length;
};

/**
 * Procesa las ventas de la ronda.
 * Calcula la demanda, genera ingresos y reduce el inventario de PT.
 */
exports.processRoundSales = async function(round) {
    const decisions = await Decision.find({ round: round, isProcessed: false });
    const allMarkets = await Market.find();

    for (const market of allMarkets) {
        // 1. Obtener todas las decisiones para este mercado en esta ronda
        const marketDecisions = decisions.filter(d => 
            d.commercial.some(c => c.marketName === market.name)
        );

        for (const dec of marketDecisions) {
            const company = await Company.findById(dec.companyId);
            const commPlan = dec.commercial.find(c => c.marketName === market.name);
            
            if (!company || !commPlan) continue;

            // 2. CALCULO DE DEMANDA (Simplificado para Fase 1)
            // Base: Potencial del mercado / numero de competidores (minimo 1)
            const baseDemand = market.demandPotential / Math.max(1, marketDecisions.length);
            
            // Aplicar Elasticidad Precio (Spec 2.3)
            // Si el precio es bajo, la demanda sube. Si es alto, baja.
            const priceFactor = Math.pow((market.priceHardCap / commPlan.price), market.priceSensitivity);
            
            // Aplicar Marketing (Bono logaritmico)
            const mktFactor = 1 + (Math.log10(commPlan.marketingInvestment + 1) * 0.15);
            
            let finalDemand = Math.floor(baseDemand * priceFactor * mktFactor);

            // 3. VALIDAR CONTRA INVENTARIO EN LA PLAZA (Rigor Logistico)
            const stockInMarket = company.inventory
                .filter(i => i.type === 'PT' && i.location === market.name && i.roundsUntilArrival === 0)
                .reduce((acc, i) => acc + i.units, 0);

            const actualSales = Math.min(finalDemand, stockInMarket);

            // 4. EJECUCION CONTABLE Y FISICA
            // Restar unidades del inventario (FIFO)
            let remainingToSell = actualSales;
            for (let lot of company.inventory) {
                if (lot.type === 'PT' && lot.location === market.name && remainingToSell > 0) {
                    const take = Math.min(lot.units, remainingToSell);
                    lot.units -= take;
                    remainingToSell -= take;
                }
            }

            // Sumar ingresos a la caja: Ventas * Precio
            const revenue = actualSales * commPlan.price;
            company.cash += revenue;

            // Restar inversion en Marketing (se paga se venda o no)
            company.cash -= commPlan.marketingInvestment;

            await company.save();
            
            console.log(`[MARKET] Empresa ${company.name} vendio ${actualSales} unidades en ${market.name}. Ingreso: $${revenue}`);
        }
    }

    // Marcar decisiones como procesadas para evitar doble cobro
    await Decision.updateMany({ round: round }, { isProcessed: true });
    
    return decisions.length;
};