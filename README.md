# platform-argentum

Aplicación web para que los chicos aprendan sobre Argentina.

> **Estado: sin código todavía.** La arquitectura y el stack ya están decididos
> y documentados en [`docs/adr/`](docs/adr/). La
> sección [Puesta en marcha](#puesta-en-marcha) describe el procedimiento
> previsto y aplica a partir del momento en que exista el proyecto.

## Qué es

Un catálogo de contenido sobre Argentina —próceres, monumentos, animales,
comida, fechas patrias, eventos históricos— pensado para que un chico lo lea, lo
entienda y lo repase jugando.

La idea no es un enciclopedismo: es que el contenido se pueda **ver a simple
vista**, con una interfaz pensada para chicos, y que arriba de ese catálogo haya
tarjetas de repaso y un juego de preguntas que refuercen lo leído.

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

El progreso del MVP se guarda **en el dispositivo**. No hay cuentas todavía.

### Después del MVP

- **Cuentas de usuario.** Solo correo electrónico, sin contraseña. Al haber
  chicos involucrados, se piden los datos mínimos indispensables y nada más.
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

cp .env.example .env.local        # completar DATABASE_URL
docker compose up -d              # PostgreSQL local

pnpm db:migrate                   # aplica las migraciones
pnpm content:import               # carga el contenido de content/ a la base
pnpm dev                          # http://localhost:3000
```

### Comandos

| Comando | Qué hace |
| ------- | -------- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm test` | Tests con Vitest |
| `pnpm db:generate` | Genera migraciones a partir del esquema |
| `pnpm db:migrate` | Aplica las migraciones pendientes |
| `pnpm content:import` | Valida e importa el contenido a la base |

## Cómo agregar contenido

El contenido vive en `content/`, en Markdown con *frontmatter*: los campos
estructurados van arriba y la descripción en el cuerpo.

```markdown
---
tipo: procer
slug: manuel-belgrano
nombre: Manuel Belgrano
nacimiento: 1770-06-03
fallecimiento: 1820-06-20
---

Abogado, economista y militar. Creó la bandera argentina en 1812…
```

Se abre un *pull request*, se revisa y se aprueba. La importación **valida cada
ficha contra el descriptor de su tipo**: si no cumple el esquema, falla y el
contenido no entra.

## Cómo se trabaja

Por **rebanadas verticales**: cada tanda de trabajo es una funcionalidad
completa —de los datos hasta la pantalla— que termina desplegada y usable. No se
construye "todo el backend" y después "todo el frontend".

## Documentación

| Ruta | Qué contiene |
| ---- | ------------ |
| [`CONTEXT.md`](CONTEXT.md) | Glosario del dominio: el vocabulario del proyecto |
| [`.claude/skills/`](.claude/skills/) | Skills del proyecto: convenciones de Git y revisión de interfaz |
| [`docs/adr/`](docs/adr/) | Decisiones arquitectónicas, con su contexto y sus alternativas |
| [`CLAUDE.md`](CLAUDE.md) | Contexto del proyecto para Claude Code |

**Antes de proponer un cambio que contradiga una decisión registrada, leé el ADR
correspondiente.** Si la decisión cambia, se escribe un ADR nuevo que supersede
al anterior; el viejo no se edita.
