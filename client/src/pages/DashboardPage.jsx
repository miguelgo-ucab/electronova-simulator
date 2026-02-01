// ============================================
// FILE: /client/src/pages/DashboardPage.jsx
// VERSION: 1.1.0
// DATE: 31-01-2026
// HOUR: 21:15
// PURPOSE: Panel de control corregido con navegacion y iconos validados.
// CHANGE LOG: Inclusion de Save en imports y activacion de useNavigate.
// SPEC REF: Seccion 5.1 - Interfaz de Usuario
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // IMPORTANTE: Para cambiar de pagina
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Wallet, 
  ShieldCheck, 
  Cpu, 
  Package, 
  LogOut, 
  TrendingUp, 
  Save // ICONO QUE FALTABA
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Inicializacion del navegador
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await api.get('/companies/my-company');
        setCompany(response.data.data.company);
      } catch (error) {
        console.error('Error cargando datos de la empresa:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 text-white font-mono">
      [SISTEMA] CARGANDO DATOS FINANCIEROS...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Barra Superior */}
      <nav className="bg-navy-900 text-white p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-electric-500" />
          <span className="font-bold text-xl tracking-tight">ElectroNova <span className="text-electric-500">OS</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium border-r border-slate-700 pr-6">
            ID: {user?.email}
          </span>
          <button onClick={logout} className="flex items-center gap-2 text-risk hover:opacity-80 transition-all font-bold text-sm">
            <LogOut size={18} /> SALIR
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-navy-900">Panel de Gestión: <span className="text-electric-500">{company?.name}</span></h2>
            <p className="text-slate-500">Estado actual de la corporación en la Ronda 1</p>
          </div>
          {/* BOTON DE ACCION A DECISIONES */}
          <button 
            onClick={() => navigate('/decision')} 
            className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-navy-800 transition-all shadow-lg flex items-center gap-2"
          >
            <Save size={18} /> INGRESAR ESTRATEGIA
          </button>
        </header>

        {/* Rejilla de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard 
            icon={<Wallet className="text-profit" />} 
            label="Capital Disponible (Cash)" 
            value={`$${company?.cash?.toLocaleString()}`} 
            color="border-l-profit"
          />
          <KPICard 
            icon={<ShieldCheck className="text-electric-500" />} 
            label="Índice de Ética" 
            value={`${company?.ethicsIndex}/100`} 
            color="border-l-electric-500"
          />
          <KPICard 
            icon={<Cpu className="text-purple-500" />} 
            label="Nivel Tecnológico" 
            value={`Nivel ${company?.techLevel}`} 
            color="border-l-purple-500"
          />
          <KPICard 
            icon={<Package className="text-orange-500" />} 
            label="Lotes en Inventario" 
            value={company?.inventory?.length || 0} 
            color="border-l-orange-500"
          />
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <Package size={20} className="text-slate-400" /> RESUMEN DE ALMACÉN
            </h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Referencia</th>
                <th className="px-6 py-4">Unidades</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {company?.inventory?.map((lot, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-xs">{lot.type}</td>
                  <td className="px-6 py-4 text-navy-800 font-medium">{lot.itemRef}</td>
                  <td className="px-6 py-4 font-mono">{lot.units}</td>
                  <td className="px-6 py-4 text-slate-600">{lot.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${lot.roundsUntilArrival === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {lot.roundsUntilArrival === 0 ? 'DISPONIBLE' : `EN CAMINO (${lot.roundsUntilArrival} R)`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-xs font-medium">
        © Maribel Pinheiro & Miguel González | Ene-2026
      </footer>
    </div>
  );
};

const KPICard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-navy-900 font-mono">{value}</p>
      </div>
    </div>
  </div>
);

export default DashboardPage;