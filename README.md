# platform-argentum

Catálogo web sobre Argentina, con prosa épica de registro alto.

> **Estado: la primera rebanada de producto está entregada.** La aplicación
> compila, corre contra PostgreSQL y está desplegada. Existen la tabla
> `entidad` con su migración, el registro de descriptores, el módulo
> `catalogo`, seis rutas en `src/app/` y la primera ficha de contenido curado
> (`contenido/procer/manuel-belgrano.ts`). `/catalogo` y `/catalogo/[slug]` se
> sirven contra el módulo real. **Todavía no existen** los otros cuatro
> módulos (`moderacion`, `aprendizaje`, `progreso`, `identidad`); las pantallas
> de `/ficha`, `/tarjetas` y `/quiz` existen como presentación, con datos
> simulados. La arquitectura y el stack están decididos y documentados en
> [`docs/adr/`](docs/adr/).

## Qué es

Un catálogo de contenido sobre Argentina —próceres, monumentos, animales,
comida, fechas patrias, eventos históricos— pensado para un lector de doce
años en adelante, que lo lea, lo entienda y lo repase jugando. La audiencia y
el registro épico de la prosa están decididos en
[ADR 0012](docs/adr/0012-audiencia-adulta-y-registro-epico.md); una versión
para chicos más chicos, en otra lengua y quizás otro diseño, está **pospuesta,
no cancelada** (ver
[`docs/decisiones-pendientes.md`](docs/decisiones-pendientes.md)).

La idea no es un enciclopedismo: es que el contenido se pueda **ver a simple
vista**, con una interfaz clara y sin fricción, y que arriba de ese catálogo
haya tarjetas de repaso y un juego de preguntas que refuercen lo leído.

El conjunto de tipos de contenido **no está cerrado a propósito**. Hoy son los
que están arriba; mañana pueden ser otros. Toda la arquitectura está diseñada
alrededor de ese hecho: agregar un tipo nuevo tiene que ser barato (ver
[ADR 0001](docs/adr/0001-modelo-de-entidad-unica-con-jsonb.md)).

## Alcance

### MVP

- **Catálogo de lectura.** Listado y ficha por entidad, para todos los tipos.
- **Tarjetas de repaso.** Con la respuesta del lado de atrás.
- **Quiz de preguntas.** Individual, con puntaje. Las preguntas y sus opciones
  se generan a partir del propio catálogo, no se redactan a mano.
- **Progreso y panel de resultados.** Qué respondiste bien, qué mal, en qué
  temas fallás más.
- **Puntos y ligas.** El puntaje cae en una liga fija: Cobre, Plata, Oro o
  Litio, los metales del suelo argentino. **No se sube ni se baja de liga, y no
  se compite con nadie.** Es un incentivo, no un ranking.

No hay cuentas todavía. **Dónde se guarda el progreso de alguien sin cuenta es
una decisión abierta a propósito**: la audiencia arranca a los doce años
(ADR 0012) y a esa edad se sigue siendo menor, así que persistir un
identificador por navegador sigue siendo una decisión sobre datos de menores,
no un detalle de implementación —la dimensión se aflojó con la nueva audiencia,
pero no desapareció—. Está registrada, con su disparador y su regla interina,
en [`docs/decisiones-pendientes.md`](docs/decisiones-pendientes.md).

### Después del MVP

- **Cuentas de usuario.** Solo correo electrónico, sin contraseña. La audiencia
  incluye menores de edad (doce años en adelante, ADR 0012), así que se piden
  los datos mínimos indispensables y nada más.
- **Propuestas de la comunidad.** Los usuarios proponen altas, modificaciones y
  bajas de contenido; **nada se publica sin que un administrador lo apruebe.**
- **Roles.** `usuario`, `admin` y `superadmin`. Un visitante sin sesión no es un
  rol: es la ausencia de sesión.
- **Aplicación mobile.** Mencionada como posibilidad a largo plazo. La
  arquitectura la admite sin reescritura (ver
  [ADR 0002](docs/adr/0002-monolito-modular-un-solo-deploy.md)).

## Cómo está construido

Una sola aplicación *fullstack*, un solo deploy, organizada en cinco módulos:

| Módulo | De qué se ocupa |
| ------ | --------------- |
| `catalogo` | Entidades, tipos y sus fichas |
| `aprendizaje` | Tarjetas de repaso y quiz |
| `progreso` | Eventos de actividad, puntos, ligas, áreas flojas |
| `moderacion` | Propuestas de la comunidad y su aprobación |
| `identidad` | Cuentas, sesiones y roles |

**Regla de límite, vinculante:** la capa web no consulta la base de datos; le
pide al módulo. Toda verificación de permisos ocurre **dentro** del módulo,
nunca solo en la interfaz.

El catálogo se guarda en **una sola tabla** con un discriminador de tipo y una
columna `JSONB`. Los campos de cada tipo se definen en **descriptores en
código**, que son la fuente única para tipar la columna, validar la importación,
validar las propuestas, y renderizar el formulario y la ficha.

El **contenido curado se escribe en archivos versionados** en este repositorio y
un script lo importa a la base, que es lo que sirve la aplicación. Así el
contenido tiene historial, revisión y vuelta atrás, sin construir nada.

## Stack

| Capa | Tecnología |
| ---- | ---------- |
| Framework | Next.js 16 · React 19 · TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL |
| Acceso a datos | Drizzle ORM |
| Validación | Zod |
| Tests | Vitest |
| Hosting | Vercel |
| Base gestionada | Neon |
| Autenticación | Better Auth *(recién en la fase de cuentas)* |

El criterio de selección fue explícito: **lo mejor para el proyecto**, no lo más
conocido ni lo más novedoso. El razonamiento completo, con las alternativas que
se descartaron y por qué, está en
[ADR 0003](docs/adr/0003-stack-nextjs-postgresql.md).

## Puesta en marcha

**Requisitos:** Node LTS, [pnpm](https://pnpm.io) y Docker.

```bash
git clone https://github.com/luciano-stefano-meloclaps/platform-argentum.git
cd platform-argentum
pnpm install

cp .env.example .env              # completar DATABASE_URL y DATABASE_URL_UNPOOLED
docker compose up -d              # PostgreSQL 18 local

pnpm db:migrate                   # aplica las migraciones
pnpm dev                          # http://localhost:3000
```

Los valores de la base local salen de `docker-compose.yml`. El archivo es `.env`
—no `.env.local`—: es el que leen `pnpm db:ping` y `drizzle.config.ts`.

### Comandos

| Comando | Qué hace |
| ------- | -------- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm typecheck` | `next typegen` y `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests con Vitest |
| `pnpm db:ping` | Verifica que la base responda |
| `pnpm db:generate` | Genera migraciones a partir del esquema |
| `pnpm db:migrate` | Aplica las migraciones pendientes |
| `pnpm contenido:importar` | Importa `contenido/` a la base, validando cada ficha contra el descriptor de su tipo ([ADR 0004](docs/adr/0004-contenido-en-archivos-versionados.md)) |

Antes de dar por terminado un cambio: `pnpm typecheck && pnpm lint && pnpm test`.

## Cómo agregar contenido

El contenido vive en `contenido/<tipo>/<slug>.ts`: **un archivo TypeScript por
entidad**, tipado por el descriptor de su tipo
([ADR 0009](docs/adr/0009-formato-del-contenido-curado.md)). El directorio es el
**tipo** y el nombre del archivo es el **slug**; la prosa larga va en template
literals.

```ts
// contenido/procer/manuel-belgrano.ts
export default {
  nombre: "Manuel Belgrano",
  datos: {
    nombreCompleto: "Manuel José Joaquín del Corazón de Jesús Belgrano",
    anioDeNacimiento: 1770,
    anioDeMuerte: 1820,
    resumen: "Abogado, economista y militar. Creó la bandera argentina en 1812.",
    semblanza: `…`,
    imagen: {
      textoAlternativo: "Retrato de Manuel Belgrano",
      credito: "Museo Histórico Nacional",
      licencia: "dominio-publico",
    },
  },
};
```

Se eligió TypeScript y no Markdown ni JSON por una razón concreta: **el error
aparece en el editor**, antes de correr nada. Las alternativas y sus trade-offs
están en el ADR 0009.

La imagen va en `public/contenido/<tipo>/<slug>.webp` y el archivo **no** declara
su ruta —se deriva del tipo y del slug—, pero sí su texto alternativo, su crédito
y su **licencia**, que es un conjunto cerrado: una imagen sin derechos declarados
no compila.

Se abre un *pull request*, se revisa y se aprueba. La importación **valida cada
ficha contra el descriptor de su tipo**: si no cumple el esquema, falla y el
contenido no entra.

## Cómo se trabaja

Por **rebanadas**: cada una es una funcionalidad completa —de los datos hasta la
pantalla— que termina desplegada y usable por sí sola. No se construye "todo el
backend" y después "todo el frontend".

Cada rebanada se corta en **tickets**, que son issues de este repositorio, y
**nada entra al historial sin un ticket que lo explique**. El trabajo lo hacen
agentes de Claude Code con roles y límites definidos en
[`CLAUDE.md`](CLAUDE.md).

El trabajo con ticket llega a la rama **`development`**: el
`delivery-specialist` pushea la rama de la rebanada y abre el *pull request*
contra `development` —nunca contra `main`—, y lo mergea. Cada uno de esos dos
pasos, push y merge, requiere la verificación explícita del usuario antes de
ejecutarse.

Mergear `development` a `main` y desplegar sigue siendo **enteramente del
usuario**, en su propio tiempo.

## Documentación

| Ruta | Qué contiene |
| ---- | ------------ |
| [`CONTEXT.md`](CONTEXT.md) | Glosario del dominio: el vocabulario del proyecto |
| [`docs/adr/`](docs/adr/) | Decisiones arquitectónicas, con su contexto y sus alternativas |
| [`docs/decisiones-pendientes.md`](docs/decisiones-pendientes.md) | Lo que **todavía no** se decidió, con su disparador y su regla interina |
| [`docs/marca/sistema-de-diseno.md`](docs/marca/sistema-de-diseno.md) | La identidad **Argentum** v1.0: paleta, tipografía y reglas de aplicación |
| [`docs/marca/sistema-de-diseno-v2.md`](docs/marca/sistema-de-diseno-v2.md) | El giro museístico de Argentum ([ADR 0015](docs/adr/0015-identidad-visual-argentum-v2.md)): logotipo, concepto y tipografía nuevos |
| [`docs/tickets-del-arranque.md`](docs/tickets-del-arranque.md) | El corte del arranque en diez cimientos, y su razonamiento |
| [`docs/agents/`](docs/agents/) | Configuración de las skills de ingeniería: tracker de issues y documentación de dominio |
| [`.claude/skills/`](.claude/skills/) | Skills del proyecto: `convenciones-git`, `revision-de-ui`, `voz-narrativa`, `investigacion-historica` e `identidad-argentum` |
| [`CLAUDE.md`](CLAUDE.md) | Contexto del proyecto para Claude Code, y el equipo de agentes |

**Antes de proponer un cambio que contradiga una decisión registrada, leé el ADR
correspondiente.** Si la decisión cambia, se escribe un ADR nuevo que supersede
al anterior; el viejo no se edita.
