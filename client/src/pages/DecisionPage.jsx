// ============================================
// FILE: /client/src/pages/DecisionPage.jsx
// VERSION: 1.7.0
// DATE: 02-02-2026
// HOUR: 10:15
// PURPOSE: Implementacion de Logistica y Rondas Dinamicas.
// CHANGE LOG: Activacion de pestaña de Distribucion y lectura de ronda desde GameId.
// SPEC REF: Seccion 2.1 (Logistica) y 2.2 (Reglas)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Save, ArrowLeft, ShoppingCart, Factory, Truck, 
  Info, AlertTriangle, CheckCircle2, DollarSign 
} from 'lucide-react';

const DecisionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('procurement');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. ESTADOS DE ESTRATEGIA
  const [procurement, setProcurement] = useState([
    { material: 'Alfa', quantity: 0, supplier: 'local' },
    { material: 'Beta', quantity: 0, supplier: 'local' },
    { material: 'Omega', quantity: 0, supplier: 'local' }
  ]);

  const [production, setProduction] = useState([
    { productName: 'Alta', quantity: 0 },
    { productName: 'Media', quantity: 0 },
    { productName: 'Básica', quantity: 0 }
  ]);

  const [commercial, setCommercial] = useState([]);
  
  // Estado de Logistica (Distribucion)
  const [logistics, setLogistics] = useState([]);

  // 2. CARGA DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, markRes] = await Promise.all([
          api.get('/companies/my-company'),
          api.get('/markets')
        ]);

        const companyData = compRes.data.data.company;
        setCompany(companyData);
        setMarkets(markRes.data.data.data);
        
        // Inicializar Comercial
        setCommercial(markRes.data.data.data.map(m => ({
          marketName: m.name,
          productName: 'Alta',
          price: 0,
          marketingInvestment: 0,
          hardCap: m.priceHardCap
        })));

        // Inicializar Logistica basado en lo que hay en fabrica
        const finishedGoods = companyData.inventory.filter(i => i.type === 'PT' && i.location === 'Novaterra');
        setLogistics(finishedGoods.map(g => ({
          productName: g.itemRef,
          destination: 'Veridia',
          quantity: 0,
          method: 'Terrestre'
        })));

      } catch (err) {
        setMessage({ type: 'error', text: 'Fallo de sincronizacion con el servidor central.' });
      }
    };
    fetchData();
  }, []);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(amount);
  };

  // 3. LOGICA FINANCIERA
  const freightRates = { Terrestre: 5, Aereo: 15 };
  const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };
  const prodCosts = { Alta: 150, Media: 100, Básica: 50 };

  const totalProcurement = procurement.reduce((sum, item) => sum + (baseCosts[item.material] * item.quantity * (item.supplier === 'local' ? 1.2 : 1)), 0);
  const totalProductionCost = production.reduce((sum, item) => sum + (item.quantity * prodCosts[item.productName]), 0);
  const totalMarketing = commercial.reduce((sum, item) => sum + item.marketingInvestment, 0);
  const totalFreight = logistics.reduce((sum, item) => sum + (item.quantity * freightRates[item.method]), 0);
  
  const estimatedInvestment = totalProcurement + totalProductionCost + totalMarketing + totalFreight;
  const totalProductionUnits = production.reduce((sum, item) => sum + item.quantity, 0);
  const remainingQuota = (company?.productionQuota || 0) - totalProductionUnits;

  const isOverQuota = remainingQuota < 0;
  const isOverBudget = estimatedInvestment > (company?.cash || 0);
  const isOverPriceCap = commercial.some(c => c.price > c.hardCap);
  const isInteractionDisabled = loading || isOverQuota || isOverBudget || isOverPriceCap;

  // 4. MANEJADORES
  const handleLogisticsChange = (idx, field, val) => {
    const newData = [...logistics];
    newData[idx][field] = field === 'quantity' ? Math.max(0, parseInt(val) || 0) : val;
    setLogistics(newData);
  };

  const handleSave = async () => {
    if (isInteractionDisabled) return;
    setLoading(true);
    try {
      await api.post('/decisions/save', {
        round: company?.gameId?.currentRound || 1,
        procurement,
        production,
        commercial,
        logistics
      });
      setMessage({ type: 'success', text: 'Estrategia integral enviada al servidor.' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error en la transmision de datos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <style>
        {` @keyframes critical-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
           .animate-blink { animation: critical-blink 0.8s infinite; } `}
      </style>

      <nav className="bg-[#0F172A] text-white p-4 shadow-2xl flex justify-between items-center sticky top-0 z-20 border-b border-slate-800">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver
        </button>
        
        <div className="flex gap-10 items-center">
          <div className="text-right border-r border-slate-700 pr-10">
            <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Inversión Estimada</p>
            <p className="text-xl font-mono" style={{ color: isOverBudget ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
              $ {formatMoney(estimatedInvestment)}
            </p>
          </div>
          <div className="text-right pr-10 border-r border-slate-700">
            <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Quota Disponible</p>
            <p className={`text-xl font-mono ${isOverQuota ? 'animate-blink' : ''}`} style={{ color: isOverQuota ? '#EF4444' : '#FFFFFF', fontWeight: 'bold' }}>
              {remainingQuota} <span className="text-xs opacity-50">u.</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Ronda Actual</p>
            <p className="text-xl font-mono font-black text-blue-400">{company?.gameId?.currentRound || 'N/A'}</p>
          </div>

          {isInteractionDisabled ? (
            <button disabled className="ml-6 px-8 py-3 rounded-xl font-black bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-2">
              <Save size={20} /> BLOQUEADO
            </button>
          ) : (
            <button onClick={handleSave} className="ml-6 px-8 py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-lg flex items-center gap-2 transition-all">
              <Save size={20} /> ENVIAR ESTRATEGIA
            </button>
          )}
        </div>
      </nav>

      <div className="px-8 mt-8 flex gap-2">
        <TabButton active={activeTab === 'procurement'} onClick={() => setActiveTab('procurement')} icon={<ShoppingCart size={18}/>} label="ABASTECIMIENTO" />
        <TabButton active={activeTab === 'production'} onClick={() => setActiveTab('production')} icon={<Factory size={18}/>} label="MANUFACTURA" />
        <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} icon={<Truck size={18}/>} label="DISTRIBUCIÓN" />
        <TabButton active={activeTab === 'commercial'} onClick={() => setActiveTab('commercial')} icon={<DollarSign size={18}/>} label="COMERCIAL" />
      </div>

      <main className="flex-1 p-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          
          {/* TAB: ABASTECIMIENTO */}
          {activeTab === 'procurement' && (
            <div className="p-12 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div> ÓRDENES DE MATERIA PRIMA
              </h3>
              <table className="w-full">
                <thead className="text-left text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <tr><th className="pb-5">INSUMO</th><th className="pb-5">CANTIDAD</th><th className="pb-5">PROVEEDOR</th><th className="pb-5 text-right">SUBTOTAL</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {procurement.map((item, i) => (
                    <tr key={i}>
                      <td className="py-8 font-black text-[#0F172A]">{item.material}</td>
                      <td className="py-8"><input type="number" className="w-36 p-4 bg-slate-50 rounded-2xl outline-none font-mono" value={item.quantity} onChange={(e) => setProcurement(procurement.map((p, idx) => idx === i ? {...p, quantity: Math.max(0, parseInt(e.target.value)||0)} : p))} /></td>
                      <td className="py-8">
                        <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={item.supplier} onChange={(e) => setProcurement(procurement.map((p, idx) => idx === i ? {...p, supplier: e.target.value} : p))}>
                          <option value="local">LOCAL (1R, +20%)</option>
                          <option value="imported">GLOBAL (2R, BASE)</option>
                        </select>
                      </td>
                      <td className="py-8 text-right font-mono font-black text-slate-900">$ {formatMoney(baseCosts[item.material] * item.quantity * (item.supplier === 'local' ? 1.2 : 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: MANUFACTURA */}
          {activeTab === 'production' && (
            <div className="p-12 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div> PLANIFICACIÓN DE PLANTA
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {production.map((item, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{item.productName}</p>
                    <input type="number" className="w-full p-5 bg-white rounded-2xl outline-none font-mono text-2xl mb-4" value={item.quantity} onChange={(e) => setProduction(production.map((p, idx) => idx === i ? {...p, quantity: Math.max(0, parseInt(e.target.value)||0)} : p))} />
                    <p className="text-xs font-bold text-slate-500">COSTO: $ {formatMoney(prodCosts[item.productName])}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DISTRIBUCIÓN (ACTIVADA) */}
          {activeTab === 'logistics' && (
            <div className="p-12 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-orange-500 rounded-full"></div> DESPACHO DE PRODUCTO TERMINADO
              </h3>
              {logistics.length === 0 ? (
                <div className="p-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">No hay stock disponible en Novaterra para distribuir.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <tr><th className="pb-5">PRODUCTO</th><th className="pb-5">DESTINO</th><th className="pb-5">CANTIDAD</th><th className="pb-5">MÉTODO</th><th className="pb-5 text-right">FLETE</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logistics.map((item, i) => (
                      <tr key={i}>
                        <td className="py-8 font-black text-[#0F172A]">{item.productName}</td>
                        <td className="py-8">
                          <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={item.destination} onChange={(e) => handleLogisticsChange(i, 'destination', e.target.value)}>
                            {markets.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                          </select>
                        </td>
                        <td className="py-8"><input type="number" className="w-32 p-4 bg-slate-50 rounded-2xl outline-none font-mono" value={item.quantity} onChange={(e) => handleLogisticsChange(i, 'quantity', e.target.value)} /></td>
                        <td className="py-8">
                          <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={item.method} onChange={(e) => handleLogisticsChange(i, 'method', e.target.value)}>
                            <option value="Terrestre">TERRESTRE ($5/u, 1R)</option>
                            <option value="Aereo">AÉREO ($15/u, 0R)</option>
                          </select>
                        </td>
                        <td className="py-8 text-right font-mono font-black text-slate-900">$ {formatMoney(item.quantity * freightRates[item.method])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB: COMERCIAL */}
          {activeTab === 'commercial' && (
            <div className="p-12 animate-in fade-in duration-300">
               {/* (Mantenemos la logica anterior de comercial) */}
               <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div> ESTRATEGIA DE MERCADO
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {commercial.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-8 rounded-3xl border border-slate-200">
                    <div className="w-1/4">
                      <p className="text-xl font-black text-[#0F172A]">{item.marketName}</p>
                      <p className="text-[10px] text-red-500 font-bold uppercase">Hard Cap: $ {formatMoney(item.hardCap)}</p>
                    </div>
                    <div className="flex gap-8 w-3/4 justify-end">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400">PRECIO</label>
                        <input type="number" className={`w-44 p-4 rounded-2xl font-mono text-lg outline-none border-2 ${item.price > item.hardCap ? 'border-red-500 bg-red-50' : 'border-transparent bg-white'}`} value={item.price} onChange={(e) => setCommercial(commercial.map((c, idx) => idx === i ? {...c, price: parseFloat(e.target.value)||0} : c))} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400">MARKETING</label>
                        <input type="number" className="w-44 p-4 rounded-2xl bg-white border-transparent font-mono text-lg outline-none" value={item.marketingInvestment} onChange={(e) => setCommercial(commercial.map((c, idx) => idx === i ? {...c, marketingInvestment: parseFloat(e.target.value)||0} : c))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-10 text-center">
        <p className="text-slate-400 text-xs font-black tracking-[0.2em]">
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-10 py-5 rounded-t-[1.5rem] font-black text-[10px] tracking-widest transition-all ${active ? 'bg-white text-blue-600 border-t border-x border-slate-200' : 'text-slate-400 hover:text-[#0F172A]'}`}
  >
    {icon} {label}
  </button>
);

export default DecisionPage;