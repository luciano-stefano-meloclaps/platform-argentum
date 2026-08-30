# 0005 — Acceso a datos con Drizzle ORM

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

El acceso a PostgreSQL se hace con **Drizzle ORM**, y las migraciones se
generan y aplican con **drizzle-kit**, quedando versionadas como archivos SQL en
el repositorio.

## Contexto

El [ADR 0003](0003-stack-nextjs-postgresql.md) fijó el stack pero dejó el ORM
**deliberadamente sin decidir**, con un criterio explícito: se elige cuando se
escriba la primera consulta real. Ese momento llegó: la primera rebanada de
trabajo incluye el módulo `catalogo`, el script de importación y la ficha de un
tipo de entidad.

El [ADR 0001](0001-modelo-de-entidad-unica-con-jsonb.md) condiciona esta
decisión más que cualquier otra consideración: el catálogo es **una sola tabla
con una columna `JSONB`** cuya forma depende del `tipo`, y los descriptores de
cada tipo viven en código TypeScript.

## Problema

Cómo hablar con la base sin perder el tipado sobre la columna `JSONB`.

Si la capa de acceso a datos devuelve `datos` como un `any` o un `unknown`, el
descriptor del ADR 0001 deja de proteger al código que lee: el compilador no
avisa nada y los errores aparecen en tiempo de ejecución. Eso vaciaría de
contenido la decisión 0001, que es la base del modelo.

## Alternativas consideradas

### A. Drizzle ORM
Esquema declarado en TypeScript plano, sin lenguaje propio ni generación de
código. Migraciones en SQL versionado vía `drizzle-kit generate` / `migrate`.

### B. Prisma
El ORM más difundido del ecosistema, con esquema en un lenguaje propio y cliente
generado.

### C. SQL directo con el driver `pg`
Sin ORM. Consultas escritas a mano, tipos declarados a mano.

### D. Posponer otra vez
Arrancar con `pg` y decidir más adelante.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Drizzle | `jsonb().$type<Datos>()` tipa la columna en compilación; el esquema es TypeScript, sin paso de generación; migraciones SQL legibles y revisables | Menos difundido que Prisma; menos material de terceros para consultar | Bajo |
| B. Prisma | Ecosistema grande, mucha documentación y ejemplos | **No tipa campos JSON de fábrica**, que es exactamente el punto crítico de nuestro modelo; esquema en un lenguaje aparte y cliente generado | Bajo |
| C. SQL directo | Cero dependencias y control total | El tipado se sostiene a mano y se desincroniza; hay que construir migraciones a mano | Bajo |
| D. Posponer | Evita comprometerse | Se pospuso una vez con buen motivo; posponerlo de nuevo ya no aporta información, solo retrasa | — |

## Decisión elegida

**Alternativa A.** Drizzle ORM como acceso a datos, drizzle-kit para
migraciones.

Alcance: Drizzle se usa **dentro de los módulos**, nunca desde la capa web. Esa
restricción viene del [ADR 0002](0002-monolito-modular-un-solo-deploy.md) y no
la modifica esta decisión.

## Motivo

El criterio decisivo es la continuidad del tipado sobre `JSONB`. Verificado en
la documentación de Drizzle (drizzle-kit 0.31.5), `jsonb().$type<Datos>()`
devuelve la columna con el tipo declarado en tiempo de compilación. Con eso, el
descriptor Zod de un tipo y la fila que sale de la base hablan el mismo idioma, y
el compilador sostiene la relación.

Prisma queda descartado justamente ahí: no tipa campos JSON de fábrica. Es el
ORM más popular, pero la popularidad no compensa fallar en el único requisito
que esta decisión tenía que cumplir.

Un segundo motivo, menor pero real: `drizzle-kit generate` produce **archivos
SQL que se commitean y se revisan antes de aplicarse**. Es la misma lógica que
se adoptó para el contenido en el [ADR 0004](0004-contenido-en-archivos-versionados.md)
—los cambios importantes pasan por el repositorio y quedan con historial—, lo
cual da coherencia al proyecto en vez de dos filosofías distintas conviviendo.

Sobre el costo de equivocarse: es bajo y eso también pesó. Drizzle vive dentro
del módulo `catalogo`; reemplazarlo por SQL directo o por otro ORM no toca la
arquitectura ni se propaga a la interfaz. Esta decisión es **cara de retrasar y
barata de revertir**, que es la combinación en la que conviene decidir rápido.

## Consecuencias

**Aceptamos:**
- Una dependencia menos difundida que Prisma: menos ejemplos de terceros y menos
  respuestas cuando aparezca un problema raro.
- Hay que escribir SQL cuando la consulta se vuelva compleja, en especial sobre
  operadores de `JSONB`.

**Obtenemos:**
- Tipado en compilación sobre `datos`, que es lo que hace utilizable el modelo
  del ADR 0001.
- Esquema en TypeScript plano, sin lenguaje propio ni paso de generación.
- Migraciones en SQL versionado, revisables antes de aplicarse.

**Deuda técnica asumida:**
- Ninguna deliberada.

**Revisar si:**
- El tipado sobre `JSONB` resulta insuficiente en la práctica y hay que validar
  igual en tiempo de ejecución en cada lectura (lo cual sería un argumento para
  bajar a SQL directo y validar con Zod en el borde del módulo).
- Drizzle deja de mantenerse activamente.
