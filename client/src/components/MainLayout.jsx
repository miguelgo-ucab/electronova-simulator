// ============================================
// FILE: /client/src/components/MainLayout.jsx
// VERSION: 1.0.0
// DATE: 06-02-2026
// HOUR: 19:20
// PURPOSE: Contenedor maestro para estandarizar la estructura visual.
// CHANGE LOG: Creación inicial.
// SPEC REF: Manual de Estilo - Sección 1
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React from 'react';

const MainLayout = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen w-full flex flex-col font-sans ${className}`}>
      {/* El contenido se expande para llenar el espacio */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;