# 0006 — Infraestructura: Vercel y Neon, con PostgreSQL local en Docker

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

La aplicación se despliega en **Vercel** y la base de datos de producción es
**Neon** (PostgreSQL gestionado). En desarrollo, PostgreSQL corre **localmente
en Docker**.

## Contexto

Un solo desarrollador, producto sin validar, sin usuarios y sin presupuesto
asignado. El [ADR 0003](0003-stack-nextjs-postgresql.md) fijó Next.js 16 y
PostgreSQL.

El plan de trabajo arranca por una rebanada 0 cuyo único objetivo es **tener algo
desplegado y accesible desde internet el primer día**, antes que cualquier
funcionalidad. La razón es que los problemas de despliegue conviene descubrirlos
al principio y no cerca de la fecha en que hay que mostrar algo.

## Problema

Dónde corre la aplicación y dónde corre la base, con dos condiciones: que el
costo sea cero o cercano a cero mientras el producto no esté validado, y que el
despliegue no consuma tiempo que hace falta en el producto.

Y una condición aparte para el desarrollo: poder trabajar sin conexión y sin
gastar cuota.

## Alternativas consideradas

### A. Vercel + Neon
Plataforma del propio framework, más PostgreSQL serverless gestionado.

### B. Un VPS con Docker
Servidor propio con la aplicación y PostgreSQL en contenedores.

### C. Supabase
PostgreSQL gestionado que además incluye autenticación, almacenamiento y tiempo
real.

### D. Base gestionada también en desarrollo
Usar Neon para desarrollo y producción, con dos ramas, sin Docker local.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Vercel + Neon | Despliegue sin configuración para Next.js; capa gratuita suficiente; entornos de vista previa por *pull request*; ramas de base de datos | Dos proveedores; los costos crecen con el uso si el producto despega | Bajo: la app es Node estándar y Neon es PostgreSQL estándar |
| B. VPS con Docker | Costo fijo y previsible; control total; sin atadura a proveedor | Tiempo de administración —actualizaciones, copias de seguridad, certificados— que hoy hace falta en el producto | Medio |
| C. Supabase | Un solo proveedor; trae autenticación y almacenamiento | Su autenticación y almacenamiento no se van a usar: el ADR 0003 ya eligió Better Auth. Se adopta una plataforma para consumir una fracción | Bajo |
| D. Base gestionada en desarrollo | Un entorno menos que mantener | Se necesita conexión para programar y se consume cuota gratuita en pruebas | Bajo |

## Decisión elegida

**Alternativa A**, con PostgreSQL local en Docker para desarrollo.

Explícitamente **no** se adopta ningún servicio propietario de Vercel más allá
del despliegue: ni su base de datos, ni su almacenamiento, ni sus colas.

## Motivo

Vercel es la plataforma del framework que ya elegimos, y para este proyecto
significa que desplegar deja de ser una tarea: se conecta el repositorio y cada
*pull request* obtiene un entorno de vista previa. Dado que el objetivo de la
rebanada 0 es exactamente "estar desplegado el día uno", elegir la opción que
hace eso trivial no requiere más justificación.

Neon aporta algo que encaja con cómo se va a trabajar: **ramas de base de
datos**. Una rama por *pull request* permite probar una migración o una
importación de contenido contra datos reales sin tocar producción. Con el
[ADR 0004](0004-contenido-en-archivos-versionados.md) —donde el contenido entra
por importación revisada— eso deja de ser una comodidad y pasa a ser útil de
verdad.

Supabase se descartó por el mismo criterio que atraviesa todo el proyecto: no
adoptar una plataforma para usar una fracción de ella. Su mayor atractivo es la
autenticación integrada, y esa decisión ya está tomada en otro sentido.

El VPS es defendible y sería la elección correcta con costos altos o con
requisitos de residencia de datos. Hoy no hay ninguna de las dos cosas, y su
costo real no es el alquiler del servidor: es el tiempo de mantenerlo, que es el
recurso más escaso del proyecto.

Sobre la atadura a proveedor, que es la objeción obvia: **es baja y deliberada**.
La aplicación es Node estándar y se puede empaquetar en un contenedor; Neon es
PostgreSQL estándar y su contenido se exporta con las herramientas de siempre.
Mientras no se adopten servicios propietarios —y la decisión dice explícitamente
que no—, mudarse es un trabajo acotado.

## Consecuencias

**Aceptamos:**
- Dependencia de dos proveedores externos y de sus capas gratuitas.
- Los costos crecen con el uso. Si el producto despega, hay que revisarlo.
- Dos entornos de base distintos (Docker local y Neon), con la posibilidad de
  divergencias de versión. Se mitiga fijando la misma versión mayor de
  PostgreSQL en ambos.

**Obtenemos:**
- Despliegue sin trabajo de configuración, desde el primer día.
- Entorno de vista previa por *pull request*, con rama de base propia.
- Cero costo de infraestructura mientras el producto no esté validado.
- Desarrollo local sin conexión y sin consumir cuota.

**Deuda técnica asumida:**
- No hay política de copias de seguridad definida más allá de la que ofrezca el
  proveedor. Hay que definirla **antes** de que exista contenido curado que
  duela perder, no después.

**Revisar si:**
- El costo mensual deja de ser despreciable.
- Aparece un requisito de residencia de datos o de cumplimiento normativo, que
  es plausible al tratarse de un producto usado por menores.
- Se necesita un proceso de larga duración que el modelo de ejecución de Vercel
  no contemple bien (por ejemplo, importaciones de contenido muy pesadas).
