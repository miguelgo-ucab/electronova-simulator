============================================
FILE: /Docs/Incidencia_01_Quota.md
VERSION: 1.0.0
DATE: 01-02-2026
HOUR: 17:05
PURPOSE: Registro de bloqueo por falta de capacidad asignada.
CHANGE LOG: Corrección manual de productionQuota en DB de producción.
SPEC REF: Sección 2.2.A - Capacidad de Producción Compartida
RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
Descripción:
El usuario no pudo enviar la decisión porque la Quota inicial por defecto es 0.
Resolución:
Se procedió a la actualización manual del campo productionQuota a 1.500 unidades en la colección companies para permitir la validación del flujo de manufactura en el Frontend.