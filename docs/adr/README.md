# Decisiones arquitectónicas (ADR)

Registro de las decisiones de arquitectura de **platform-argentum**, cada una
con el contexto en el que se tomó, las alternativas que se consideraron y las
consecuencias que se aceptaron.

Su valor real aparece meses después, cuando alguien —incluido tu yo futuro— se
pregunta por qué las cosas están así.

## Índice

| ADR | Decisión | Estado |
| --- | -------- | ------ |
| [0001](0001-modelo-de-entidad-unica-con-jsonb.md) | Modelo de entidad única con JSONB y descriptores en código | Aceptado |
| [0002](0002-monolito-modular-un-solo-deploy.md) | Aplicación fullstack modular, un solo deploy | Aceptado |
| [0003](0003-stack-nextjs-postgresql.md) | Stack: Next.js 16, React 19, TypeScript y PostgreSQL | Aceptado |
| [0004](0004-contenido-en-archivos-versionados.md) | Contenido curado en archivos versionados, importado a la base | Aceptado |
| [0005](0005-acceso-a-datos-drizzle.md) | Acceso a datos con Drizzle ORM | Aceptado |
| [0006](0006-infraestructura-vercel-neon.md) | Infraestructura: Vercel y Neon, con PostgreSQL local en Docker | Aceptado |
| [0007](0007-severidad-del-compilador-de-typescript.md) | Severidad del compilador de TypeScript | Aceptado |
| [0008](0008-identidad-visual-argentum.md) | Identidad visual Argentum | Aceptado — corregido parcialmente por 0015 |
| [0009](0009-formato-del-contenido-curado.md) | Formato, ubicación e imágenes del contenido curado | Aceptado |
| [0011](0011-extension-explicita-en-imports-relativos-de-valor.md) | Extensión explícita en los imports relativos de valor | Aceptado |
| [0012](0012-audiencia-adulta-y-registro-epico.md) | Audiencia de chicos grandes y adultos, con registro épico | Aceptado |
| [0013](0013-el-registro-de-lectura-no-es-una-entidad.md) | El registro de lectura no es una entidad: dos prosas, una fila | Aceptado |
| [0014](0014-historiador-especialista-y-neutralidad-en-disputas-politicas.md) | Historiador especialista y neutralidad en disputas políticas | Aceptado |
| [0015](0015-identidad-visual-argentum-v2.md) | Identidad visual Argentum v2: giro museístico e institucional | Aceptado |

**El 0010 no existe y no se reutiliza.** Hubo un
`0010-agentes-pueden-escribir-en-vercel-con-confirmacion.md` que se retiró y se
borró del árbol; sigue en el historial de git. El número queda quemado para que
una referencia vieja al 0010 no apunte a una decisión distinta.

## Cuándo escribir un ADR

Se escribe un ADR cuando la decisión es **cara de revertir**, condiciona otras
decisiones, afecta el modelo de datos o de despliegue, introduce una dependencia
estructural, toca seguridad o autorización, o define un límite entre
componentes.

**No** escribas un ADR para decisiones triviales o reversibles con bajo costo:
el ruido le quita valor a los que sí importan. Tailwind, pnpm o Vitest, por
ejemplo, no llevan ADR.

## Cómo se usan

1. Copiá [`0000-template.md`](0000-template.md) a `NNNN-titulo-en-kebab-case.md`,
   con el siguiente número libre.
2. Completalo **cuando la decisión se aprueba**, no cuando se propone.
3. Un ADR aprobado **no se edita para cambiar la decisión**. Si la decisión
   cambia, se escribe uno nuevo que la supersede y se marca el anterior como
   `Superseded by NNNN`.
4. Agregá la fila correspondiente al índice de arriba.

## Estados

`Propuesto` · `Aceptado` · `Rechazado` · `Superseded by NNNN`

## Precedencia

**Estos ADR mandan sobre cualquier guía externa**, incluidas las skills
instaladas en `.agents/skills/`. Si una skill recomienda algo que contradice un
ADR, gana el ADR. Si la recomendación es mejor, se escribe un ADR nuevo que
supersede al anterior — no se ignora el viejo en silencio.

## Documentos relacionados

| Ruta | Qué contiene |
| ---- | ------------ |
| [`../../CONTEXT.md`](../../CONTEXT.md) | Glosario del dominio: el vocabulario del proyecto |
| [`../decisiones-pendientes.md`](../decisiones-pendientes.md) | Lo que todavía **no** se decidió, con su disparador y su regla interina |
| [`../marca/sistema-de-diseno.md`](../marca/sistema-de-diseno.md) | La identidad visual Argentum v1.0, adoptada por el ADR 0008 |
| [`../marca/sistema-de-diseno-v2.md`](../marca/sistema-de-diseno-v2.md) | El giro museístico de la identidad Argentum, adoptado por el ADR 0015 (supersede parcialmente al 0008) |
| [`../../CLAUDE.md`](../../CLAUDE.md) | Estado, stack y decisiones resumidas, para agentes |
