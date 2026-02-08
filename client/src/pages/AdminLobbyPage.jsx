// ============================================
// FILE: /client/src/pages/AdminLobbyPage.jsx
// VERSION: 2.0.0
// DATE: 07-02-2026
// HOUR: 11:20
// PURPOSE: Lobby de gestión integral (CRUD) de salas de simulación.
// CHANGE LOG: Formulario expandido con parámetros de Specs y modo Edición.
// SPEC REF: Sección 3 (Configuración de Partida)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../components/MainLayout';
import { Plus, Trash2, LogIn, ShieldAlert, LogOut, LayoutGrid, Settings, Save, X } from 'lucide-react';

const AdminLobbyPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    gameCode: '',
    maxRounds: 8,
    totalCapacity: 6000,
    obsolescenceRate: 10,
    initialCash: 500000
  });

  const fetchGames = async () => {
    try {
      const res = await api.get('/games/all');
      setGames(res.data.data.games);
    } catch (error) { console.error('Error cargando salas'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGames(); }, []);

  const resetForm = () => {
    setFormData({ gameCode: '', maxRounds: 8, totalCapacity: 6000, obsolescenceRate: 10, initialCash: 500000 });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (game) => {
    setFormData({
      gameCode: game.gameCode,
      maxRounds: game.maxRounds,
      totalCapacity: game.totalCapacity,
      obsolescenceRate: game.obsolescenceRate || 10,
      initialCash: game.initialCash || 500000
    });
    setIsEditing(true);
    setEditId(game._id);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gameCode) return;
    try {
      if (isEditing) {
        await api.put(`/games/${editId}`, formData);
        alert('Sala actualizada correctamente.');
      } else {
        await api.post('/games/create', formData);
      }
      resetForm();
      fetchGames();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar sala');
    }
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm('¿ELIMINAR SALA? Se perderá todo el progreso.')) return;
    try { await api.delete(`/games/${gameId}`); fetchGames(); } 
    catch (error) { alert('Error al eliminar'); }
  };

  const handleEnter = (gameId) => {
    // Navegación precisa a la sala seleccionada
    navigate(`/admin/console/${gameId}`);
  };

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión de administrador?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <MainLayout className="bg-[#0F172A] text-slate-100">
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-blue-500" size={28} />
          <h1 className="text-xl font-black tracking-tighter uppercase">Admin <span className="text-blue-500">Lobby</span></h1>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
          <LogOut size={14} /> Desconectar
        </button>
      </nav>

      <main className="p-10 max-w-6xl mx-auto">
        {/* FORMULARIO DE CONFIGURACIÓN */}
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 mb-12 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
              {isEditing ? <Settings className="text-orange-500" /> : <Plus className="text-blue-400" />} 
              {isEditing ? 'Editar Configuración de Sala' : 'Nueva Sala de Simulación'}
            </h2>
            {isEditing && (
              <button onClick={resetForm} className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1">
                <X size={14} /> CANCELAR EDICIÓN
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Código de Sala</label>
              <input 
                type="text" 
                placeholder="EJ: ALPHA" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white outline-none focus:border-blue-500 uppercase placeholder:text-slate-700 disabled:opacity-50"
                value={formData.gameCode}
                onChange={(e) => setFormData({...formData, gameCode: e.target.value})}
                disabled={isEditing} // El código no se edita para no romper vínculos
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Rondas Totales</label>
              <input type="number" min="1" max="20" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white outline-none focus:border-blue-500"
                value={formData.maxRounds} onChange={(e) => setFormData({...formData, maxRounds: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Capacidad Planta Global</label>
              <input type="number" step="100" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white outline-none focus:border-blue-500"
                value={formData.totalCapacity} onChange={(e) => setFormData({...formData, totalCapacity: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Capital Inicial ($)</label>
              <input type="number" step="1000" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white outline-none focus:border-blue-500"
                value={formData.initialCash} onChange={(e) => setFormData({...formData, initialCash: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Tasa Obsolescencia (%)</label>
              <input type="number" min="0" max="100" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white outline-none focus:border-blue-500"
                value={formData.obsolescenceRate} onChange={(e) => setFormData({...formData, obsolescenceRate: parseInt(e.target.value)})} />
            </div>

            <div className="flex items-end">
              <button type="submit" className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isEditing ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                <Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Crear Sala'}
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO DE SALAS */}
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <LayoutGrid size={16} /> Salas Activas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-2xl font-black text-white tracking-tight">{game.gameCode}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Ronda: <span className="text-blue-400">{game.currentRound} / {game.maxRounds}</span></p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Capacidad: <span className="text-white">{game.totalCapacity} u.</span></p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${game.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {game.status}
                </span>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleEnter(game._id)} // Pasamos el ID, no el código
                  className="flex-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn size={14} /> Gestionar
                </button>
                <button 
                  onClick={() => handleEdit(game)}
                  className="p-3 bg-slate-950 text-slate-500 hover:text-orange-500 border border-slate-800 rounded-xl transition-colors"
                  title="Configurar"
                >
                  <Settings size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(game._id)}
                  className="p-3 bg-slate-950 text-slate-500 hover:text-red-500 border border-slate-800 rounded-xl transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="p-10 text-center border-t border-slate-800/50 mt-10">
        <p className="text-slate-600 text-[10px] font-black tracking-[0.2em]">
          © Maribel Pinheiro & Miguel González | Ene-2026
        </p>
      </footer>
    </MainLayout>
  );
};

export default AdminLobbyPage;