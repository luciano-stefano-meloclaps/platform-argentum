---
name: revision-de-ui
description: Revisa código de interfaz contra las Web Interface Guidelines: accesibilidad, foco, formularios, animación, tipografía, imágenes, gestos táctiles, áreas seguras, `theme-color` e hidratación (el proyecto no tiene modo oscuro). Usala al revisar una pantalla, un componente, o cuando se pida auditar accesibilidad o UX.
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

La audiencia del catálogo son **chicos grandes y adultos, de doce años en
adelante** (ADR 0012), con una prosa épica de registro alto. La versión para
chicos más chicos está **pospuesta, no cancelada** — ver
`docs/decisiones-pendientes.md`. Eso no afloja ningún piso de accesibilidad:
este producto se usa en pantallas baratas, de brillo bajo y a veces al sol
(ADR 0008), y una prosa épica —más larga y más densa que una llana— se
sostiene mejor con ese piso, no peor. Cuando haya que ordenar los hallazgos,
estas categorías van primero:

1. **Accesibilidad** — etiquetas, roles, navegación por teclado, textos
   alternativos.
2. **Objetivos táctiles** — tamaño y separación de lo que se toca.
3. **Movimiento** — respetar `prefers-reduced-motion`.
4. **Foco visible** — nunca eliminar el indicador de foco sin reemplazarlo.

## Reglas de `guidelines.md` que no aplican

`guidelines.md` es una copia versionada y no se edita a mano, así que las
excepciones se anotan acá. Estas reglas no se reportan:

- **[no aplica]** *Curly quotes* en *Typography*: la prosa del catálogo usa
  comillas latinas «» o rectas (`voz-narrativa`, sección 3).
- **[no aplica]** *Title Case* en *Content & Copy*: es una convención del
  inglés; el español se escribe en mayúscula de oración.
- **[no aplica]** `color-scheme: dark` y el `background-color` explícito del
  `<select>` nativo, en *Dark Mode & Theming*: este proyecto no tiene modo
  oscuro (`identidad-argentum`, regla 12; se decide con un ADR nuevo).
  `<meta name="theme-color">` sí aplica, contra el fondo claro de la página.

## Precedencia

Estas reglas son una **guía**, no autoridad. Si alguna contradice un ADR de
`docs/adr/` o el vocabulario de `CONTEXT.md`, gana el ADR. Ver la sección
*Skills* de `CLAUDE.md`.
