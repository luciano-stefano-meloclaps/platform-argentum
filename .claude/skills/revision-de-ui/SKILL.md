---
name: revision-de-ui
description: Revisa código de interfaz contra las Web Interface Guidelines: accesibilidad, foco, formularios, animación, tipografía, imágenes, gestos táctiles, áreas seguras, modo oscuro e hidratación. Usala al revisar una pantalla, un componente, o cuando se pida auditar accesibilidad o UX.
argument-hint: <archivo-o-patrón>
allowed-tools: Read Glob Grep
---

# Revisión de interfaz

Revisá los archivos indicados contra las reglas de
[`guidelines.md`](./guidelines.md), que está **en este repositorio**: no bajes
nada de internet.

## Proceso

1. Si no se indicaron archivos, preguntá cuáles revisar.
2. Leé `guidelines.md` completo y los archivos a revisar.
3. Reportá los incumplimientos en formato `archivo:línea`, agrupados por
   archivo. Conciso: sacrificá la gramática antes que la señal.
4. Un archivo sin hallazgos se marca `✓ ok`.

## Prioridad para este proyecto

La aplicación la usan **chicos**. Cuando haya que ordenar los hallazgos, estas
categorías van primero:

1. **Accesibilidad** — etiquetas, roles, navegación por teclado, textos
   alternativos.
2. **Objetivos táctiles** — tamaño y separación de lo que se toca.
3. **Movimiento** — respetar `prefers-reduced-motion`.
4. **Foco visible** — nunca eliminar el indicador de foco sin reemplazarlo.

## Precedencia

Estas reglas son una **guía**, no autoridad. Si alguna contradice un ADR de
`docs/adr/` o el vocabulario de `CONTEXT.md`, gana el ADR. Ver la sección
*Skills* de `CLAUDE.md`.
