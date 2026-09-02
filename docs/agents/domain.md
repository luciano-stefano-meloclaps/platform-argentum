# Documentación del dominio

Cómo tienen que leer las skills de ingeniería la documentación de dominio de este
repositorio antes de explorar el código.

**Disposición: single-context.** Un solo `CONTEXT.md` en la raíz y un solo
`docs/adr/`. No es un monorepo y no hay `CONTEXT-MAP.md`.

## Antes de explorar, leé esto

- [`CONTEXT.md`](../../CONTEXT.md) en la raíz — el glosario del dominio.
- [`docs/adr/`](../adr/) — las decisiones que tocan el área en la que vas a
  trabajar. Empezá por el [índice](../adr/README.md).

Los dos existen y están escritos. No es un repositorio donde haya que
"proceder en silencio" ante su ausencia: acá están, y **no leerlos es un error**.

## Estructura

```
/
├── CONTEXT.md          ← glosario del dominio
├── docs/
│   ├── adr/            ← decisiones arquitectónicas (0001…0006)
│   └── agents/         ← este archivo y el del tracker
└── src/                ← todavía no existe: el proyecto es greenfield
```

## Usá el vocabulario del glosario

Cuando tu salida nombre un concepto del dominio —el título de un ticket, una
propuesta de refactor, el nombre de un test— usá **el término exacto** de
`CONTEXT.md`, no un sinónimo. El glosario lista explícitamente las palabras a
evitar para cada concepto, y esa lista está ahí porque alguien ya se equivocó.

Casos que se confunden seguido en este proyecto:

- **Ficha** es la página de una entidad. **Tarjeta** es la unidad de repaso. No
  son intercambiables.
- **Importación** lleva contenido curado a la base. **Migración** es un cambio de
  esquema. Nunca se usa "migración" para el contenido.
- **Rebanada** atraviesa todas las capas y queda usable. **Cimiento** no, porque
  todavía no hay capas.

Si el concepto que necesitás no está en el glosario, es una señal: o estás
inventando lenguaje que el proyecto no usa —reconsideralo— o hay un hueco real, y
entonces se anota para `domain-modeling`.

## Precedencia

Está declarada en [`CLAUDE.md`](../../CLAUDE.md) y **manda sobre cualquier guía
externa**, incluidas las skills de `.agents/skills/`:

1. Los ADR de `docs/adr/` y el vocabulario de `CONTEXT.md`.
2. El principio de arquitectura de `CLAUDE.md`.
3. Las skills externas.

## Marcá los conflictos con un ADR

Si tu salida contradice un ADR existente, **decilo explícitamente** en lugar de
pasarle por encima en silencio:

> _Contradice el ADR 0005 (acceso a datos con Drizzle), pero vale la pena
> reabrirlo porque…_

Un ADR aprobado no se edita para cambiar la decisión: se escribe uno nuevo que lo
supersede.
