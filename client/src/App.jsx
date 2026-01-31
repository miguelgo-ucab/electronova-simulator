// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.0.0
// DATE: 31-01-2026
// HOUR: 13:10
// PURPOSE: Componente principal de prueba para validar estilos.
// CHANGE LOG: Implementacion de colores Navy y Electric Blue del Manual.
// SPEC REF: Manual de Estilo - Seccion 2
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="p-10 bg-white shadow-xl rounded-2xl border border-slate-200">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">
          ElectroNova <span className="text-electric-500">Inc.</span>
        </h1>
        <p className="text-slate-600 font-mono">
          [SISTEMA OPERATIVO - MODO DESARROLLO]
        </p>
        <div className="mt-6 flex gap-4">
          <div className="px-4 py-2 bg-profit text-white rounded-lg text-sm font-bold">
            CASH: $500,000
          </div>
          <div className="px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-bold">
            ESTADO: CONECTADO
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;