# 0017 — El punto de entrada de un módulo se llama como el módulo

- **Estado:** Aceptado
- **Fecha:** 2026-09-18
- **Decide:** el usuario; **redacta:** el `super-architect`
- **Supersede parcialmente:** [0016](0016-arquitectura-de-la-capa-web.md), y
  **solo** en el nombre del archivo del puerto de entrada. Todo lo demás del
  0016 —las once reglas, la forma de la vista-modelo, el prerenderizado, la
  estructura de carpetas— sigue vigente sin cambios.

## Decisión

El puerto de entrada de un módulo es **`src/<modulo>/<modulo>.ts`**, no
`src/<modulo>/index.ts`. Para el único módulo que existe hoy:
**`src/catalogo/catalogo.ts`**.

Sigue siendo **la única superficie de importación** del módulo, con las mismas
tres funciones (`listarPorTipo`, `obtenerPorSlug`, `listarSlugs`) y los mismos
tipos que cruzan. Cambia el nombre del archivo, nada más.

## Contexto

El ADR 0016 se redactó el 2026-09-09 y se recuperó al árbol el 2026-09-16. En
el medio, el módulo `catalogo` se implementó (ticket #31) y **el archivo se
escribió como `catalogo.ts`**, no como `index.ts`. La regla de ESLint que hace
cumplir el límite del ADR 0002 —`no-restricted-imports` sobre `src/app/**`— se
escribió contra ese nombre, y su comentario ya dejó anotado el desvío
(`eslint.config.mjs:29-30`).

Resultado: el 0016 dice `index.ts` y el árbol dice `catalogo.ts`. Una auditoría
documental lo encontró, y hay que resolverlo en un sentido o en el otro: un ADR
que no describe el código no sirve como fuente.

## Problema

¿Se renombra el archivo para que coincida con el ADR, o se corrige el ADR para
que coincida con el archivo? No es una cuestión de prolijidad: el nombre lo van
a copiar los otros cuatro módulos del ADR 0002, así que se elige una vez y se
paga cuatro veces más.

## Alternativas consideradas

### A. `index.ts`, el idioma de siempre de Node y de los bundlers
Lo que decía el 0016. Permite importar `@/catalogo` sin nombrar el archivo.

### B. `<modulo>.ts` — el archivo se llama como el módulo
Lo que hay hoy en el árbol. Obliga a escribir la ruta completa,
`@/catalogo/catalogo.ts`, que además es lo que ya pide el ADR 0011 (extensión
explícita en los imports de valor).

### C. No hacer nada
Dejar el ADR diciendo una cosa y el código otra.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. `index.ts` | Convención universal; import más corto | En una pestaña del editor y en un stack trace dice `index.ts`, que no identifica nada: con cinco módulos hay cinco pestañas iguales. La ergonomía del import corto además ya está anulada por el ADR 0011, que obliga a escribir la extensión | Bajo (un `git mv` y dos imports) |
| B. `<modulo>.ts` | El nombre identifica al archivo en la pestaña, en el stack trace, en el buscador de archivos y en el diff. Escala a los cinco módulos sin ambigüedad. **Ya es lo que existe y lo que la regla de ESLint hace cumplir** | Se aparta de una convención que todo el mundo reconoce; el import es un poco más largo | Bajo |
| C. No hacer nada | Cero trabajo hoy | El ADR deja de ser fuente confiable, que es lo único que un ADR tiene | Alto |

## Decisión elegida

**Alternativa B.** El punto de entrada se llama como el módulo.

## Motivo

El argumento ya estaba escrito antes de esta decisión, en el comentario de
`eslint.config.mjs`: **un `index.ts` es invisible en una pestaña del editor y en
un stack trace.** Con cinco módulos serían cinco archivos homónimos, y el nombre
del archivo es justamente la información que una pestaña, una traza y un
resultado de búsqueda muestran primero.

El único beneficio real de `index.ts` —poder escribir `@/catalogo` a secas— no
existe en este repositorio: el ADR 0011 obliga a la extensión explícita en todo
import de valor, así que la ruta se escribe completa igual. Se pagaba el costo
sin cobrar el beneficio.

Y hay un argumento de menor peso pero que vale: el código, la regla de ESLint y
su comentario ya coinciden entre sí. El desalineado es el documento.

## Consecuencias

- El puerto de entrada de cada módulo nuevo (`moderacion`, `aprendizaje`,
  `progreso`, `identidad`) se llama `<modulo>.ts`. **No se crea ningún
  `index.ts` de módulo.**
- La Regla 1 del ADR 0016 se lee con este nombre. Su contenido —una sola
  superficie de importación, tres funciones, nada de `src/db/*` ni del interior
  del módulo— no cambia.
- `eslint.config.mjs` y `CLAUDE.md` quedan alineados con el árbol. El 0016 lleva
  una nota de superseción parcial en su encabezado; **su texto no se edita**.
- No hay cambio de código: el árbol ya está así.
