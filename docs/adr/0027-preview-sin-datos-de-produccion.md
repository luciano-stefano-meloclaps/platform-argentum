# 0027 — `preview` nunca recibe datos de producción: rama sin padre, poblada desde el repositorio

- **Estado:** Aceptado. **Supersede parcialmente** al
  [ADR 0023](0023-bases-separadas-por-entorno-y-guarda-del-destino.md) en un
  punto: `preview` deja de ser «hija de `main`». Cumple el disparador que el
  propio 0023 dejó escrito para la llegada de `identidad`.
- **Fecha:** 2026-10-02
- **Decide:** el `super-architect`, por delegación explícita del usuario
  («decidan entre los agentes»), con el relevamiento del `infra-specialist`.

## Decisión

1. **La rama `preview` de Neon es una rama *schema-only*: raíz, sin padre**, y
   se puebla solo desde el repositorio (`db:migrate` y `contenido:importar`,
   con la guarda del destino del ADR 0023). Nunca recibe datos de `main`.
2. **Regla que rige desde hoy, exista ya la rama nueva o no:** sobre `preview`
   no se hace **«Reset from parent»** ni **«restore» desde `main`** ni desde un
   snapshot de `main`. Las dos operaciones copian datos de producción.
3. **Esto se hace antes de cerrar el #123.** Mientras no haya variables de
   Better Auth en Vercel, nadie puede crear una cuenta en producción y no hay
   nada que copiar. Apenas se cargan, sí.

## Contexto

El ADR 0023 creó `preview` como hija de `main` y dejó escrito: con cuentas, eso
copia datos personales, y «la llegada del módulo `identidad`» obliga a
decidirlo antes. `identidad` llegó (ADR 0019) y su migración se aplicó en
producción, pero nadie retomó el disparador.

Relevamiento del `infra-specialist` (lectura, 2026-10-02):

- `preview` (`br-bitter-resonance-aw8b55is`) se creó el 2026-09-26 con
  `init_source: parent-data`, **antes** de la migración de identidad. No tiene
  las tablas de Better Auth y tiene 0 entidades: está desfasada.
- `main` tiene las tablas de identidad con **0 usuarios**. Hoy no hay datos
  personales en ninguna rama.
- `docs/runbooks/entornos-y-bases.md` documenta «Reset from parent» como la
  manera de renovar `preview`.
- Neon admite ramas *schema-only*: raíz, sin padre y sin «reset from parent»;
  en el plan Free, hasta 3 ramas raíz
  (https://neon.com/docs/guides/branching-schema-only). El MCP de Neon no
  puede crearlas (`create_branch` no expone `init_source`); se crean desde la
  consola.

## Problema

La audiencia arranca a los doce años (ADR 0012). La primera cuenta real en
producción convierte el procedimiento documentado para `preview` en una copia
de datos personales, posiblemente de menores, a una base con menos controles
que la de producción.

## Alternativas consideradas

### A. Rama *schema-only* sin padre
La garantía es estructural: no hay padre del que copiar.

### B. Mantener la rama hija y prohibir el reset por conducta
Más barata: no cambia el endpoint. La garantía depende de que nadie apriete el
botón.

### C. Rama con datos anonimizados (Neon, en Beta)
No verificado si el plan Free la incluye, y hoy no hay nada que anonimizar.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| **A** | Imposible copiar datos de `main` por accidente; el contenido curado ya vive en archivos (ADR 0004) | La crea el usuario en la consola; cambia el endpoint y hay que recargar `DATABASE_URL` de Preview en Vercel | Bajo |
| B | Cero pasos manuales | Una sola operación mal elegida copia datos personales | Bajo |
| C | Permite datos realistas | Beta, sin verificar en el plan, sin necesidad presente | Medio |

## Decisión elegida

**A**, con la regla del punto 2 vigente desde hoy.

## Motivo

`preview` nunca necesita datos de producción: todo lo que muestra el catálogo
sale del repositorio (ADR 0004), y las cuentas de prueba se crean en la propia
vista previa. Si la rama no necesita datos de `main`, lo más simple y seguro es
que no pueda recibirlos. La alternativa B deja la protección de datos de
menores en una regla de conducta, que es justamente lo que una garantía
estructural evita, y cuesta casi lo mismo.

## Consecuencias

**Aceptamos:**
- Pasos manuales del usuario en la consola de Neon (crear la rama) y en Vercel
  (recargar `DATABASE_URL` de Preview), y que `preview` se mantenga al día
  migrando e importando, no reseteando.
- `preview` arranca sin cuentas: quien prueba crea las suyas.

**Obtenemos:**
- Ningún camino documentado copia datos de producción a otro entorno.

**Deuda técnica asumida:**
- Sin verificar: una rama *schema-only* trae `drizzle.__drizzle_migrations`
  vacía, así que `db:migrate` podría intentar reaplicar la 0000 sobre tablas
  que ya existen. El procedimiento exacto (vaciar los esquemas y migrar desde
  cero, u otro) lo define el `database-specialist` con el `infra-specialist`
  antes de crear la rama.

**Revisar si:**
- Aparece una necesidad real de probar con datos parecidos a los de
  producción: ahí se evalúa la anonimización, con un ADR.
