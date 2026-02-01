// ============================================
// FILE: /client/src/pages/DecisionPage.jsx
// VERSION: 1.5.0
// DATE: 01-02-2026
// HOUR: 11:40
// PURPOSE: Blindaje total de animaciones y formato monetario de alta precision.
// CHANGE LOG: Inyeccion de CSS Keyframes para parpadeo y validacion de costos.
// SPEC REF: Seccion 2.2.A (Capacidad) y 2.3 (Motor de Mercado)
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
  Info, AlertTriangle, CheckCircle2 
} from 'lucide-react';

const DecisionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('procurement');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await api.get('/companies/my-company');
        setCompany(res.data.data.company);
      } catch (err) {
        setMessage({ type: 'error', text: 'Terminal financiero desconectado.' });
      }
    };
    loadCompany();
  }, []);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };
  const prodCosts = { Alta: 150, Media: 100, Básica: 50 };

  const totalProcurement = procurement.reduce((sum, item) => {
    let cost = baseCosts[item.material] * item.quantity;
    return sum + (item.supplier === 'local' ? cost * 1.2 : cost);
  }, 0);

  const totalProductionUnits = production.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductionCost = production.reduce((sum, item) => sum + (item.quantity * prodCosts[item.productName]), 0);
  
  const estimatedInvestment = totalProcurement + totalProductionCost;
  const remainingQuota = (company?.productionQuota || 0) - totalProductionUnits;
  
  const isOverQuota = remainingQuota < 0;
  const isOverBudget = estimatedInvestment > (company?.cash || 0);
  const isInteractionDisabled = loading || isOverQuota || isOverBudget;

  const handleProcurementChange = (idx, field, val) => {
    const newData = [...procurement];
    newData[idx][field] = field === 'quantity' ? Math.max(0, parseInt(val) || 0) : val;
    setProcurement(newData);
  };

  const handleProductionChange = (idx, val) => {
    const newData = [...production];
    newData[idx].quantity = Math.max(0, parseInt(val) || 0);
    setProduction(newData);
  };

  const handleSave = async () => {
    if (isInteractionDisabled) return;
    setLoading(true);
    try {
      await api.post('/decisions/save', {
        round: 1,
        procurement,
        production,
        logistics: []
      });
      setMessage({ type: 'success', text: 'Estrategia integral validada y transmitida.' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Fallo en la red.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* INYECCION DE CSS PARA PARPADEO FORZADO */}
      <style>
        {`
          @keyframes critical-blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
          .animate-blink {
            animation: critical-blink 0.8s infinite;
          }
        `}
      </style>

      <nav className="bg-[#0F172A] text-white p-4 shadow-2xl flex justify-between items-center sticky top-0 z-20 border-b border-slate-800">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> VOLVER AL CENTRO DE MANDO
        </button>
        
        <div className="flex gap-10 items-center">
          <div className="text-right border-r border-slate-700 pr-10">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Inversión Estimada</p>
            <p className="text-xl font-mono" style={{ color: isOverBudget ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
              $ {formatMoney(estimatedInvestment)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Capacidad Disponible</p>
            <p className={`text-xl font-mono ${isOverQuota ? 'animate-blink' : ''}`} style={{ color: isOverQuota ? '#EF4444' : '#FFFFFF', fontWeight: 'bold' }}>
              {remainingQuota} <span className="text-xs opacity-50">u.</span>
            </p>
          </div>

          {isInteractionDisabled ? (
            <button disabled className="ml-4 px-8 py-3 rounded-xl font-black bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-2 transition-none">
              <Save size={20} /> {loading ? 'PROCESANDO...' : 'ENVIAR ESTRATEGIA'}
            </button>
          ) : (
            <button onClick={handleSave} className="ml-4 px-8 py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer transition-all">
              <Save size={20} /> ENVIAR ESTRATEGIA
            </button>
          )}
        </div>
      </nav>

      {message.text && (
        <div className={`m-6 p-5 rounded-2xl flex items-center gap-4 border-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <div className="px-8 mt-8 flex gap-2">
        <TabButton active={activeTab === 'procurement'} onClick={() => setActiveTab('procurement')} icon={<ShoppingCart size={18}/>} label="ABASTECIMIENTO" />
        <TabButton active={activeTab === 'production'} onClick={() => setActiveTab('production')} icon={<Factory size={18}/>} label="MANUFACTURA" />
        <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} icon={<Truck size={18}/>} label="DISTRIBUCIÓN" />
      </div>

      <main className="flex-1 p-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          {activeTab === 'procurement' && (
            <div className="p-12 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                ÓRDENES DE MATERIA PRIMA
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="pb-5">INSUMO</th>
                    <th className="pb-5">CANTIDAD</th>
                    <th className="pb-5">PROVEEDOR ESTRATÉGICO</th>
                    <th className="pb-5 text-right">SUBTOTAL ESTIMADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {procurement.map((item, i) => {
                    const subtotal = baseCosts[item.material] * item.quantity * (item.supplier === 'local' ? 1.2 : 1);
                    return (
                      <tr key={i}>
                        <td className="py-8">
                          <span className="font-black text-[#0F172A] text-lg">{item.material}</span>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">COSTO BASE: $ {formatMoney(baseCosts[item.material])}/U</p>
                        </td>
                        <td className="py-8">
                          <input type="number" className="w-36 p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-mono text-lg" value={item.quantity} onChange={(e) => handleProcurementChange(i, 'quantity', e.target.value)} />
                        </td>
                        <td className="py-8">
                          <select className="p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm text-[#0F172A]" value={item.supplier} onChange={(e) => handleProcurementChange(i, 'supplier', e.target.value)}>
                            <option value="local">PROVEEDOR LOCAL (1R, +20%)</option>
                            <option value="imported">GLOBAL IMPORT (2R, BASE)</option>
                          </select>
                        </td>
                        <td className="py-8 text-right font-mono font-black text-slate-900 text-xl">
                          $ {formatMoney(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="p-12 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-[#0F172A] mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                PLANIFICACIÓN DE PLANTA
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {production.map((item, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">LÍNEA DE PRODUCTO</p>
                    <p className="text-2xl font-black text-[#0F172A] mb-6">{item.productName.toUpperCase()}</p>
                    <input type="number" className="w-full p-5 bg-white rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-mono text-2xl mb-6 shadow-inner" placeholder="0" value={item.quantity} onChange={(e) => handleProductionChange(i, e.target.value)} />
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>COSTO UNITARIO</span>
                      <span className="text-blue-600">$ {formatMoney(prodCosts[item.productName])}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="p-24 text-center">
              <Truck size={40} className="mx-auto text-slate-300 mb-8" />
              <h3 className="text-2xl font-black text-[#0F172A]">MÓDULO DE DISTRIBUCIÓN</h3>
              <p className="text-slate-500 mt-4 max-w-md mx-auto">Habilitado al detectar Producto Terminado (PT).</p>
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