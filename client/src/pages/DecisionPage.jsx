// ============================================
// FILE: /client/src/pages/DecisionPage.jsx
// VERSION: 1.0.0
// DATE: 31-01-2026
// HOUR: 16:00
// PURPOSE: Interfaz para el ingreso de la estrategia de la ronda.
// CHANGE LOG: Implementacion de la seccion de Abastecimiento con calculo de costos.
// SPEC REF: Seccion 5.1 - Formulario de Decisiones
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, ShoppingCart, Info } from 'lucide-react';

const DecisionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado de la decision (Procurement)
  const [procurement, setProcurement] = useState([
    { material: 'Alfa', quantity: 0, supplier: 'local' },
    { material: 'Beta', quantity: 0, supplier: 'local' },
    { material: 'Omega', quantity: 0, supplier: 'local' }
  ]);

  const baseCosts = { Alfa: 15, Beta: 20, Omega: 25 };

  // Calculo del costo total proyectado
  const calculateTotal = () => {
    return procurement.reduce((total, item) => {
      let cost = baseCosts[item.material] * item.quantity;
      if (item.supplier === 'local') cost *= 1.2;
      return total + cost;
    }, 0);
  };

  const handleInputChange = (index, field, value) => {
    const newProcurement = [...procurement];
    newProcurement[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setProcurement(newProcurement);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/decisions/save', {
        round: 1, // En el futuro esto sera dinamico
        procurement: procurement
      });
      setMessage({ type: 'success', text: 'Estrategia de abastecimiento guardada correctamente.' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al guardar la decision.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header de Accion */}
      <nav className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-navy-900 font-bold transition-colors">
          <ArrowLeft size={20} /> VOLVER AL PANEL
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Inversión Estimada</p>
            <p className="text-xl font-mono font-bold text-navy-900">${calculateTotal().toLocaleString()}</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-electric-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
          >
            <Save size={18} /> {loading ? 'GUARDANDO...' : 'CONFIRMAR DECISIÓN'}
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-navy-900 flex items-center gap-3">
            <ShoppingCart className="text-electric-500" /> Plan de Abastecimiento
          </h2>
          <p className="text-slate-500 mt-2">Defina las órdenes de compra de materia prima para la siguiente ronda.</p>
        </header>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-risk'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Material</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Cantidad</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Proveedor</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procurement.map((item, idx) => {
                const subtotal = baseCosts[item.material] * item.quantity * (item.supplier === 'local' ? 1.2 : 1);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-bold text-navy-900">{item.material}</span>
                      <p className="text-[10px] text-slate-400">Costo Base: ${baseCosts[item.material]}/u</p>
                    </td>
                    <td className="px-8 py-6">
                      <input 
                        type="number" 
                        min="0"
                        className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-md font-mono focus:ring-2 focus:ring-electric-500 outline-none"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        className="p-2 bg-white border border-slate-200 rounded-md text-sm font-medium outline-none focus:ring-2 focus:ring-electric-500"
                        value={item.supplier}
                        onChange={(e) => handleInputChange(idx, 'supplier', e.target.value)}
                      >
                        <option value="local">Local (+20% Costo, 1R)</option>
                        <option value="imported">Importado (Costo Base, 2R)</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-bold text-navy-800">
                      ${subtotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="p-6 bg-navy-900 text-white flex items-start gap-4">
            <Info className="text-electric-500 shrink-0" size={20} />
            <div className="text-xs leading-relaxed opacity-80">
              <strong>Nota Estratégica:</strong> Los materiales comprados a proveedores <strong>Locales</strong> llegarán al almacén en la ronda siguiente. Las compras <strong>Importadas</strong> tardarán 2 rondas en estar disponibles para producción.
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-xs font-medium">
        © Maribel Pinheiro & Miguel González | Ene-2026
      </footer>
    </div>
  );
};

export default DecisionPage;