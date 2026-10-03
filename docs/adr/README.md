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
| [0003](0003-stack-nextjs-postgresql.md) | Stack: Next.js 16, React 19, TypeScript y PostgreSQL | Aceptado — supersedido parcialmente por 0019 |
| [0004](0004-contenido-en-archivos-versionados.md) | Contenido curado en archivos versionados, importado a la base | Aceptado |
| [0005](0005-acceso-a-datos-drizzle.md) | Acceso a datos con Drizzle ORM | Aceptado |
| [0006](0006-infraestructura-vercel-neon.md) | Infraestructura: Vercel y Neon, con PostgreSQL local en Docker | Aceptado — supersedido parcialmente por 0010 y 0023 |
| [0007](0007-severidad-del-compilador-de-typescript.md) | Severidad del compilador de TypeScript | Aceptado |
| [0008](0008-identidad-visual-argentum.md) | Identidad visual Argentum | Aceptado — supersedido parcialmente por 0012 y 0015 |
| [0009](0009-formato-del-contenido-curado.md) | Formato, ubicación e imágenes del contenido curado | Aceptado |
| [0010](0010-agentes-pueden-escribir-en-vercel-con-confirmacion.md) | Los agentes pueden escribir en Vercel, siempre bajo confirmación | Aceptado — supersedido parcialmente por 0025 |
| [0011](0011-extension-explicita-en-imports-relativos-de-valor.md) | Extensión explícita en los imports relativos de valor | Aceptado |
| [0012](0012-audiencia-adulta-y-registro-epico.md) | Audiencia de chicos grandes y adultos, con registro épico | Aceptado |
| [0013](0013-el-registro-de-lectura-no-es-una-entidad.md) | El registro de lectura no es una entidad: dos prosas, una fila | Aceptado |
| [0014](0014-historiador-especialista-y-neutralidad-en-disputas-politicas.md) | Historiador especialista y neutralidad en disputas políticas | Aceptado |
| [0015](0015-identidad-visual-argentum-v2.md) | Identidad visual Argentum v2: giro museístico e institucional | Aceptado |
| [0016](0016-arquitectura-de-la-capa-web.md) | Arquitectura de la capa web (hexagonal con MVVM) | Aceptado — supersedido parcialmente por 0017, 0018 y 0019 |
| [0017](0017-nombre-del-punto-de-entrada-de-un-modulo.md) | El punto de entrada de un módulo se llama como el módulo | Aceptado |
| [0018](0018-puerto-de-salida-del-modulo-catalogo-pospuesto.md) | El puerto de salida del módulo `catalogo` queda pospuesto | Aceptado |
| [0019](0019-modulo-identidad-con-better-auth.md) | El módulo `identidad` se construye sobre Better Auth, con email y contraseña más Google | Aceptado — supersedido parcialmente por 0020 |
| [0020](0020-sesion-en-la-nav-leida-desde-el-cliente.md) | La sesión de la barra de navegación se lee desde el cliente | Aceptado |
| [0021](0021-mcp-de-neon-detras-de-un-hook.md) | El MCP de Neon, detrás de un hook | Aceptado — supersedido parcialmente por 0022 y 0025 |
| [0022](0022-infra-specialist-y-guarda-del-mcp-de-vercel.md) | Un especialista de infraestructura dueño de Vercel y Neon, y la guarda del MCP de Vercel | Aceptado — supersedido parcialmente por 0024 y 0025 |
| [0023](0023-bases-separadas-por-entorno-y-guarda-del-destino.md) | Bases separadas por entorno en Neon y una guarda del destino para los comandos de base | Aceptado — supersedido parcialmente por 0024, 0025 y 0027 |
| [0024](0024-agentes-pueden-escribir-en-produccion-con-confirmacion-en-el-momento.md) | Agentes pueden escribir en producción, con confirmación del usuario en el momento | Aceptado — supersedido parcialmente por 0025 |
| [0025](0025-un-solo-ejecutor-de-escrituras-en-produccion.md) | Un solo agente ejecuta escrituras en producción: el `infra-specialist` | Aceptado |
| [0026](0026-politica-de-errores-de-los-modulos.md) | Política de errores de los módulos: ausencia, resultado y excepción | Aceptado |
| [0027](0027-preview-sin-datos-de-produccion.md) | `preview` nunca recibe datos de producción: rama sin padre, poblada desde el repositorio | Aceptado |

## Lectura vigente por tema

Varios temas se decidieron en capas: un ADR posterior corrige o reemplaza una
parte de uno anterior. Para cada tema, **leé en este orden**; el primero manda
donde dos se contradicen, y el resto sigue vigente en lo que el primero no toca.

| Tema | Lectura vigente (en orden) | Qué reemplaza qué |
| ---- | -------------------------- | ----------------- |
| Producción | [0025](0025-un-solo-ejecutor-de-escrituras-en-produccion.md), luego [0024](0024-agentes-pueden-escribir-en-produccion-con-confirmacion-en-el-momento.md) | El 0025 fija quién ejecuta (el `infra-specialist`); el 0024 aporta la confirmación en el momento. Reemplazan en parte a 0010, 0021, 0022 y 0023 |
| `preview` | [0027](0027-preview-sin-datos-de-produccion.md), luego [0023](0023-bases-separadas-por-entorno-y-guarda-del-destino.md) | El 0027 reemplaza en parte al 0023 (la rama de `preview`, sin padre) |
| Marca | [0015](0015-identidad-visual-argentum-v2.md) sobre [0008](0008-identidad-visual-argentum.md) | El 0015 reemplaza concepto, logotipo, paleta y tipografía del 0008; el 0012 retira la justificación de su sección 8 |
| Capa web | [0016](0016-arquitectura-de-la-capa-web.md), [0017](0017-nombre-del-punto-de-entrada-de-un-modulo.md) y [0018](0018-puerto-de-salida-del-modulo-catalogo-pospuesto.md) | El 0017 renombra el punto de entrada; el 0018 pospone el puerto de salida; el 0019 acota tres reglas para `identidad` |
| Identidad | [0019](0019-modulo-identidad-con-better-auth.md), luego [0020](0020-sesion-en-la-nav-leida-desde-el-cliente.md) | El 0020 enmienda solo la Regla 4 del 0019 (la sesión de la barra de navegación) |

**Vocabulario de estado.** Un ADR vigente dice «Aceptado». Si otro ADR lo
reemplaza en parte, dice «Aceptado — supersedido parcialmente por NNNN», y el
encabezado del propio ADR explica en qué punto. Si lo reemplaza entero, dice
«Superseded by NNNN». Las dos puntas de una supersesión se declaran: la del
ADR nuevo y la del viejo.

**El 0016 recupera un ADR que había perdido su número.** El 2026-09-09 se
escribió, en una rama que nunca se mergeó completa, un ADR de arquitectura de la
capa web numerado 0015. Mientras esa rama seguía sin integrarse, otra rama tomó
el mismo número para la identidad visual v2 y sí llegó a `development` — así que
el 0015 vigente hoy es ese, y la decisión de arquitectura de la capa web, ya
implementada en el módulo `catalogo`, no tenía ADR en el árbol. Se recuperó y
renumeró como 0016; el archivo trae la nota de procedencia completa.

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
   `Superseded by NNNN` (o «supersedido parcialmente por NNNN» en su
   encabezado, diciendo en qué punto). Marcar el estado del anterior no es
   editarlo: es dejar constancia.
4. Agregá la fila correspondiente al índice de arriba.

## Estados

`Propuesto` · `Aceptado` · `Aceptado — supersedido parcialmente por NNNN` · `Rechazado` · `Superseded by NNNN`

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
