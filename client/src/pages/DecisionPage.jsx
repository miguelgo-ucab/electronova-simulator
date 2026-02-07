// ============================================
// FILE: /client/src/pages/DecisionPage.jsx
// VERSION: 2.3.0
// DATE: 06-02-2026
// HOUR: 22:10
// PURPOSE: Refactorización de UI con componentes internos y protección contra crashes.
// CHANGE LOG: Componente TabHeader, blindaje de array de mercados y EmptyState explícito.
// SPEC REF: Manual de Estilo - Sección 4
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import FormulaTooltip from '../components/FormulaTooltip';
import { 
  Save, ArrowLeft, ShoppingCart, Factory, Truck, 
  DollarSign, AlertTriangle, CheckCircle2, Box, Info
} from 'lucide-react';

const DecisionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('procurement');
  const [loading, setLoading] = useState(true); // Iniciamos cargando
  const [company, setCompany] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const COLORS = { navy: '#0F172A', blue: '#3B82F6', green: '#10B981', red: '#EF4444' };

  // ESTADOS INICIALES
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
  const [logistics, setLogistics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, markRes] = await Promise.all([api.get('/companies/my-company'), api.get('/markets')]);
        
        const companyData = compRes.data.data.company;
        // Blindaje: Asegurar que marketsData sea un array válido
        const marketsData = markRes.data.data.data || markRes.data.data || [];
        
        setCompany(companyData);
        setMarkets(marketsData);
        
        // Inicializar Comercial
        setCommercial(marketsData.map(m => ({ 
          marketName: m.name, 
          productName: 'Alta', 
          price: 0, 
          marketingInvestment: 0, 
          hardCap: m.priceHardCap 
        })));
        
        // Inicializar Logística
        const finishedGoods = companyData.inventory.filter(i => i.type === 'PT' && i.location === 'Novaterra');
        
        // Solo intentamos mapear si hay mercados disponibles para evitar crash
        const defaultDest = marketsData.length > 0 ? marketsData[0].name : '';
        
        setLogistics(finishedGoods.map(g => ({ 
          productName: g.itemRef, 
          destination: defaultDest, 
          quantity: 0, 
          method: 'Terrestre' 
        })));

      } catch (err) { 
        console.error(err);
        setMessage({ type: 'error', text: 'Error de conexión con el núcleo de datos.' }); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };
  const prodCosts = { Alta: 150, Media: 100, Básica: 50 };
  const freightRates = { Terrestre: 5, Aereo: 15 };

  // CÁLCULOS
  const totalProc = procurement.reduce((s, i) => s + (baseCosts[i.material] * i.quantity * (i.supplier === 'local' ? 1.2 : 1)), 0);
  const totalProd = production.reduce((s, i) => s + (i.quantity * prodCosts[i.productName]), 0);
  const totalMkt = commercial.reduce((s, i) => s + i.marketingInvestment, 0);
  const totalLog = logistics.reduce((s, i) => s + (i.quantity * freightRates[i.method]), 0);
  
  const estimatedInvestment = totalProc + totalProd + totalMkt + totalLog;
  const remainingQuota = (company?.productionQuota || 0) - production.reduce((s, i) => s + i.quantity, 0);

  const isOverQuota = remainingQuota < 0;
  const isOverBudget = estimatedInvestment > (company?.cash || 0);
  const isOverPriceCap = commercial.some(c => c.price > c.hardCap);
  const isInteractionDisabled = loading || isOverQuota || isOverBudget || isOverPriceCap;

  const handleSave = async () => {
    if (isInteractionDisabled) return;
    setLoading(true);
    try {
      await api.post('/decisions/save', { round: company?.gameId?.currentRound || 1, procurement, production, commercial, logistics });
      setMessage({ type: 'success', text: 'Estrategia guardada correctamente.' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) { setMessage({ type: 'error', text: 'Error al enviar.' }); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center font-mono text-slate-400">CARGANDO TERMINAL...</div>;

  return (
    <div className="min-h-screen font-sans bg-[#F1F5F9] pb-24 md:pb-0">
      <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } } .animate-blink { animation: blink 0.8s infinite; }`}</style>

      {/* NAV */}
      <nav className="bg-[#0F172A] text-white p-4 shadow-2xl sticky top-0 z-[100]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1600px] mx-auto">
          <div className="w-full md:w-auto flex justify-between items-center">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-all">
              <ArrowLeft size={16} /> <span className="hidden md:inline">Volver</span>
            </button>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 md:hidden">
               <span className="text-[10px] font-black text-blue-400 uppercase">Ronda {company?.gameId?.currentRound || 1}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-8 items-center w-full">
            <div className="text-center md:text-right border-r border-slate-700 pr-4 md:pr-8">
              <p className="text-[9px] text-slate-400 uppercase font-black">Inversión</p>
              <p className="text-lg md:text-xl font-mono font-bold" style={{ color: isOverBudget ? COLORS.red : COLORS.green }}>
                {formatCurrency(estimatedInvestment)}
              </p>
            </div>
            <div className="text-center md:text-right pr-4 md:pr-8 border-r border-slate-700">
              <p className="text-[9px] text-slate-400 uppercase font-black">Capacidad</p>
              <p className={`text-lg md:text-xl font-mono font-bold ${isOverQuota ? 'animate-blink' : ''}`} style={{ color: isOverQuota ? COLORS.red : 'white' }}>
                {formatNumber(remainingQuota)} <span className="text-xs text-slate-500">u.</span>
              </p>
            </div>
            <div className="hidden md:block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
               <span className="text-xs font-black text-blue-400 uppercase">Ronda {company?.gameId?.currentRound || 1}</span>
            </div>
            
            <div className="fixed bottom-4 left-4 right-4 md:static md:block z-[200]">
              {isInteractionDisabled ? (
                <button disabled className="w-full md:w-auto px-6 py-3 rounded-xl font-black bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-xl">
                  {isOverPriceCap ? 'PRECIO EXCESIVO' : 'BLOQUEADO'}
                </button>
              ) : (
                <button onClick={handleSave} className="w-full md:w-auto px-6 py-3 rounded-xl font-black bg-[#3B82F6] text-white hover:bg-blue-500 shadow-xl active:scale-95 flex items-center justify-center gap-2">
                  <Save size={18} /> ENVIAR
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MENSAJES */}
      {message.text && (
        <div className={`mx-4 mt-4 md:mx-10 md:mt-6 p-4 rounded-xl flex items-center gap-3 border-2 ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 /> : <AlertTriangle />} <span className="font-bold text-xs md:text-sm">{message.text}</span>
        </div>
      )}

      {/* TABS */}
      <div className="px-4 md:px-10 mt-6 grid grid-cols-2 md:flex gap-2 md:gap-4 overflow-x-auto pb-2">
        <TabButton active={activeTab === 'procurement'} onClick={() => setActiveTab('procurement')} icon={<ShoppingCart size={16}/>} label="COMPRAS" />
        <TabButton active={activeTab === 'production'} onClick={() => setActiveTab('production')} icon={<Factory size={16}/>} label="FÁBRICA" />
        <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} icon={<Truck size={16}/>} label="ENVÍOS" />
        <TabButton active={activeTab === 'commercial'} onClick={() => setActiveTab('commercial')} icon={<DollarSign size={16}/>} label="VENTAS" />
      </div>

      <main className="flex-1 p-4 md:p-10">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 min-h-[500px] overflow-visible">
          <div className="p-6 md:p-12">
            
            {/* 1. ABASTECIMIENTO */}
            {activeTab === 'procurement' && (
              <div className="animate-in fade-in duration-500">
                <TabHeader title="Órdenes de Materia Prima" color="bg-blue-600" tooltip={{ title: "Costo MP", formula: "C = Q * P * Mod", tip: "Local +20% / Importado +0%" }} />
                
                <div className="overflow-x-auto pb-4">
                  <table className="w-full min-w-[600px]">
                    <thead className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="pb-5 text-left">Insumo</th>
                        <th className="pb-5 text-left">Cantidad</th>
                        <th className="pb-5 text-left">Proveedor</th>
                        <th className="pb-5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {procurement.map((item, i) => (
                        <tr key={i} className="group">
                          <td className="py-6 font-black text-[#0F172A] text-base md:text-lg">{item.material}</td>
                          <td className="py-6">
                            <input type="number" className="w-24 md:w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-blue-500 focus:bg-white transition-all" value={item.quantity} onChange={(e) => setProcurement(procurement.map((p, idx) => idx === i ? {...p, quantity: Math.max(0, parseInt(e.target.value)||0)} : p))} />
                          </td>
                          <td className="py-6">
                            <select className="w-32 md:w-auto p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs md:text-sm outline-none cursor-pointer" value={item.supplier} onChange={(e) => setProcurement(procurement.map((p, idx) => idx === i ? {...p, supplier: e.target.value} : p))}>
                              <option value="local">LOCAL (1R)</option>
                              <option value="imported">GLOBAL (2R)</option>
                            </select>
                          </td>
                          <td className="py-6 text-right font-mono font-black text-slate-900 text-base md:text-lg">
                            {formatCurrency(baseCosts[item.material] * item.quantity * (item.supplier === 'local' ? 1.2 : 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* 2. MANUFACTURA */}
            {activeTab === 'production' && (
              <div className="animate-in fade-in duration-500">
                <TabHeader title="Planificación de Planta" color="bg-purple-600" tooltip={{ title: "Quota Planta", formula: "Q = 6000 / N_Empresas", tip: "Capacidad no acumulable." }} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {production.map((item, i) => (
                    <div key={i} className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{item.productName}</p>
                      <input type="number" className="w-full p-4 bg-white rounded-xl border border-slate-200 outline-none font-mono text-xl md:text-2xl mb-4 focus:border-purple-500 transition-all" value={item.quantity} onChange={(e) => setProduction(production.map((p, idx) => idx === i ? {...p, quantity: Math.max(0, parseInt(e.target.value)||0)} : p))} />
                      <p className="text-xs font-bold text-purple-600 uppercase">Costo: {formatCurrency(prodCosts[item.productName])}/u</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. LOGÍSTICA (CORREGIDA) */}
            {activeTab === 'logistics' && (
              <div className="animate-in fade-in duration-500">
                <TabHeader title="Distribución Logística" color="bg-orange-500" tooltip={{ title: "Flete", formula: "C = Q * Tasa", tip: "Aéreo llega hoy." }} />
                
                {logistics.length === 0 ? (
                  // EMPTY STATE VISIBLE
                  <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6">
                    <div className="bg-white p-6 rounded-full shadow-sm"><Box size={40} className="text-slate-300" /></div>
                    <div>
                      <h4 className="text-xl font-black text-slate-700">Sin Inventario en Fábrica</h4>
                      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                        No hay Producto Terminado (PT) disponible en Novaterra. <br/>
                        Ejecuta la <strong>Manufactura</strong> y procesa la ronda para generar stock.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-4">
                    <table className="w-full min-w-[700px]">
                      <thead className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="pb-5 text-left">Producto</th>
                          <th className="pb-5 text-left">Destino</th>
                          <th className="pb-5 text-left">Cantidad</th>
                          <th className="pb-5 text-left">Método</th>
                          <th className="pb-5 text-right">Flete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {logistics.map((item, i) => (
                          <tr key={i} className="group">
                            <td className="py-6 font-black text-[#0F172A] text-lg">{item.productName}</td>
                            <td className="py-6">
                              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs md:text-sm outline-none cursor-pointer focus:border-orange-500" value={item.destination} onChange={(e) => {
                                const newData = [...logistics]; newData[i].destination = e.target.value; setLogistics(newData);
                              }}>
                                {markets.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                              </select>
                            </td>
                            <td className="py-6">
                              <input type="number" className="w-24 md:w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-orange-500 focus:bg-white transition-all" value={item.quantity} onChange={(e) => {
                                const newData = [...logistics]; newData[i].quantity = Math.max(0, parseInt(e.target.value)||0); setLogistics(newData);
                              }} />
                            </td>
                            <td className="py-6">
                              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs md:text-sm outline-none cursor-pointer focus:border-orange-500" value={item.method} onChange={(e) => {
                                const newData = [...logistics]; newData[i].method = e.target.value; setLogistics(newData);
                              }}>
                                <option value="Terrestre">TERRESTRE ($5/u)</option>
                                <option value="Aereo">AÉREO ($15/u)</option>
                              </select>
                            </td>
                            <td className="py-6 text-right font-mono font-black text-slate-900 text-lg">
                              {formatCurrency(item.quantity * freightRates[item.method])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. COMERCIAL */}
            {activeTab === 'commercial' && (
               <div className="animate-in fade-in duration-500">
                 <TabHeader title="Estrategia de Mercado" color="bg-green-500" tooltip={{ title: "Score (SC)", formula: "SC = P_inv * 0.4 + Mkt_log * 0.3", tip: "Marketing alto compensa precio alto." }} />
                 
                 <div className="grid grid-cols-1 gap-6">
                   {commercial.map((item, i) => (
                     <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 gap-6 shadow-sm hover:shadow-md transition-all">
                       <div className="w-full md:w-1/4">
                         <p className="text-lg md:text-xl font-black text-[#0F172A]">{item.marketName}</p>
                         <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Hard Cap: {formatCurrency(item.hardCap)}</p>
                       </div>
                       <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-3/4 justify-end">
                         <div className="w-full md:w-auto">
                           <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Precio Venta</label>
                           <input type="number" className={`w-full md:w-40 p-3 rounded-xl font-mono text-lg outline-none border-2 ${item.price > item.hardCap ? 'border-red-500 bg-red-50' : 'border-transparent bg-white'} focus:border-green-500 transition-all`} value={item.price} onChange={(e) => setCommercial(commercial.map((c, idx) => idx === i ? {...c, price: parseFloat(e.target.value)||0} : c))} />
                         </div>
                         <div className="w-full md:w-auto">
                           <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Marketing</label>
                           <input type="number" className="w-full md:w-40 p-3 rounded-xl bg-white border-2 border-transparent font-mono text-lg outline-none focus:border-green-500 transition-all" value={item.marketingInvestment} onChange={(e) => setCommercial(commercial.map((c, idx) => idx === i ? {...c, marketingInvestment: parseFloat(e.target.value)||0} : c))} />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

// COMPONENTES AUXILIARES ESTANDARIZADOS
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-2 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-t-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all w-full md:w-auto ${active ? 'bg-white text-blue-600 shadow-sm md:border-t md:border-x border-slate-200' : 'text-slate-400 hover:text-[#0F172A] hover:bg-slate-100'}`}>
    {icon} <span className="hidden md:inline">{label}</span><span className="md:hidden">{label.slice(0,4)}...</span>
  </button>
);

const TabHeader = ({ title, color, tooltip }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] flex items-center gap-3 tracking-tight">
      <div className={`w-1.5 h-6 md:w-2 md:h-8 ${color} rounded-full`}></div>
      {title}
    </h3>
    {tooltip && <FormulaTooltip title={tooltip.title} formula={tooltip.formula} tip={tooltip.tip} />}
  </div>
);

export default DecisionPage;