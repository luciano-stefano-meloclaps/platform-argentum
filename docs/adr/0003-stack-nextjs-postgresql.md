# 0003 — Stack: Next.js 16, React 19, TypeScript y PostgreSQL

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

El stack es **Next.js 16 + React 19 + TypeScript + PostgreSQL**, con **Zod**
como validación y definición de los descriptores por tipo. Cuando llegue la fase
de cuentas, la autenticación se resuelve con **Better Auth**.

La elección de ORM queda **deliberadamente diferida** (ver Motivo).

## Contexto

Proyecto greenfield sin stack heredado. Un solo desarrollador, que declaró no
haber usado Next.js.

El criterio de selección lo fijó explícitamente el dueño del producto y es el
que gobierna este ADR: **"la prioridad es el negocio y no lo que sé o utilizo"**,
y antes: **"no me importa la elección para aprender, sino lo mejor para el
proyecto"**. El aprendizaje quedó descartado como criterio de decisión.

Las decisiones 0001 y 0002 ya estaban tomadas cuando se evaluó el stack, y lo
condicionan: modelo de entidad única con JSONB y descriptores en código,
monolito modular con un solo deploy.

Hecho relevante sobre la naturaleza del trabajo: la actividad dominante de los
próximos meses es **iterar la interfaz para chicos** —fichas, tarjetas de
repaso, quiz—. Un catálogo con moderación es un problema de backend resuelto
hace décadas; que un chico de diez años quiera volver al día siguiente, no.

## Problema

Elegir lenguaje, framework y base de datos sin sobredimensionar el sistema y sin
comprometer el crecimiento posterior.

## Alternativas consideradas

Todas las alternativas se verificaron contra documentación vigente vía Context7,
no de memoria.

### A. Astro 6 + PostgreSQL
Excelente para catálogos de contenido: colecciones con `defineCollection`,
cargadores `glob()`/`file()` y esquemas Zod que generan tipos de TypeScript.

### B. Django 6 + PostgreSQL
Framework maduro con un panel de administración incluido que, a primera vista,
resuelve gratis el flujo de moderación: `@admin.action(permissions=["publish"])`
más `queryset.update(status="p")` y `list_filter`.

### C. ASP.NET Core 10 + React
Backend robusto, con autorización por roles declarativa dentro del framework:
`[Authorize(Roles = "Admin, Superuser")]`, respaldada por ASP.NET Core Identity.

### D. Next.js 16 + React 19 + PostgreSQL
Un solo lenguaje en todo el sistema. Guía oficial de autenticación con el patrón
de capa de acceso a datos en un módulo `server-only`.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Astro 6 | Inmejorable para el catálogo; Zod nativo, alineado con ADR 0001 | Más flojo en la parte interactiva (quiz, tarjetas) y en el flujo de moderación, que son el corazón del producto | Medio |
| B. Django 6 | Moderación casi gratis; framework y autenticación de una sola pieza, mantenidos juntos | Dos lenguajes: el descriptor se escribe en Python y otra vez en TypeScript. Además el panel edita `JSONField` como un textarea de JSON crudo salvo que se construyan widgets propios vía `formfield_overrides` — es decir, la moderación "gratis" no lo es sobre nuestro modelo | Alto |
| C. ASP.NET Core 10 | Autorización por roles declarativa y dentro del framework; estabilidad de versiones muy superior al ecosistema JS | Dos lenguajes (mismo problema que B), dos proyectos, dos deploys; contradice ADR 0002; se pierde renderizado en servidor del catálogo salvo agregarlo aparte | Alto |
| D. Next.js 16 | Un solo lenguaje; el descriptor se escribe una vez; renderizado en servidor para el catálogo; ecosistema React para la UI interactiva; camino directo a React Native | Autenticación por librería de terceros; el ecosistema JS rota más rápido y Next.js rompe convenciones entre versiones mayores | Medio |

## Decisión elegida

**Alternativa D.** Next.js 16, React 19, TypeScript, PostgreSQL y Zod.

Autenticación con Better Auth **cuando llegue la fase de cuentas**, no antes: el
MVP no tiene cuentas (el progreso se guarda en el dispositivo).

## Motivo

El argumento decisivo viene del ADR 0001: **el descriptor de cada tipo se usa en
cinco lugares** —tipar la columna JSONB, validar la importación, validar las
propuestas de usuarios, renderizar el formulario y renderizar la ficha—. Con
TypeScript y Zod se escribe una sola vez y esos cinco usos no pueden
desincronizarse. Con Django o .NET las mismas reglas se escriben en dos
lenguajes y quedan condenadas a divergir.

Ese argumento se aplicó de forma consistente: es el mismo motivo por el que se
descartó Django y por el que se descartó .NET. Aceptar uno y rechazar el otro
por el mismo criterio habría invalidado el criterio.

Sobre Django en particular: su ventaja aparente era el panel de administración
como flujo de moderación gratuito. Verificado contra la documentación de Django
6, esa ventaja **se cae sobre nuestro modelo**: un `JSONField` se edita por
defecto como un textarea de JSON crudo, y hacerlo usable exige widgets propios
mediante `formfield_overrides`. Lo gratuito dejaba de serlo justamente en el
único lugar donde importaba.

Sobre .NET, en honor a la evaluación completa: **gana** en dos ejes reales. Su
autorización por roles es declarativa y la mantiene Microsoft, lo cual es más
duradero que una dependencia de terceros; y su estabilidad de versiones es
superior a la del ecosistema JavaScript. Se descartó igual porque sus fortalezas
se concentran donde este proyecto no está exigido (throughput, coordinación de
equipos, integración empresarial) y sus costos caen donde sí lo está: iteración
de interfaz, un solo desarrollador, un modelo de datos compartido entre capas.
La variante Blazor —que resolvería el problema del lenguaje único— se descartó
porque el ecosistema para interfaz rica, animada y con minijuegos es
sensiblemente más pobre que el de React, y esa es la parte que define si el
producto funciona.

Sobre autenticación y roles, que era la preocupación explícita del dueño: Next.js
tiene guía oficial de autenticación, y el patrón que recomienda —verificar
sesión y rol dentro de un módulo `server-only`— **es exactamente el límite que
ya se había decidido en el ADR 0002 por otras razones**. Better Auth aporta
`admin({ adminRoles: ["admin", "superadmin"] })`, control de acceso por permisos
con `createAccessControl`, y enlace mágico por correo —que encaja con la decisión
previa de pedir únicamente el correo, sin contraseña—. Para mobile a futuro
provee el plugin `bearer()` e integración con Expo.

Sobre el ORM: se lo consideró inicialmente como parte de esta decisión y **fue un
error de categoría**. Un ORM vive dentro del módulo `catalogo`; cambiarlo o bajar
a SQL directo es trabajo de una tarde y no toca la arquitectura. Se decide cuando
se escriba la primera consulta real. Dato verificado para ese momento: Drizzle
tipa JSONB en compilación con `jsonb().$type<Datos>()`, mientras que Prisma no
tipa campos JSON de fábrica —relevante dado el ADR 0001.

## Consecuencias

**Aceptamos:**
- El ecosistema JavaScript rota más rápido que .NET o Django. Habrá trabajo de
  actualización entre versiones mayores de Next.js.
- La autenticación depende de una librería de terceros y no del framework. El
  riesgo está acotado porque vive detrás del módulo `identidad` (ADR 0002):
  reemplazarla no se propaga al resto del sistema.
- El desarrollador no conoce el framework. Se asume una curva inicial.

**Obtenemos:**
- Un solo lenguaje en todo el sistema; el modelo de datos y sus validaciones
  escritos una sola vez.
- Renderizado en servidor para el catálogo, que importa para que el contenido
  sea indexable y cargue rápido.
- El ecosistema de React para la parte interactiva, que es donde se juega el
  producto.
- Si mobile termina siendo React Native, los descriptores y esquemas Zod se
  comparten como código en lugar de reescribirse.

**Deuda técnica asumida:**
- ORM sin decidir. Es deliberado y de bajo riesgo: la decisión se toma con la
  primera consulta real y queda contenida en un módulo.

**Revisar si:**
- El peso del sistema se corre marcadamente al backend (reglas de negocio
  complejas, integraciones, reportería pesada).
- Entra un equipo con experiencia consolidada en otro stack.
- Better Auth queda sin mantenimiento activo: habría que reemplazarlo dentro del
  módulo `identidad`.
