# 0002 — Aplicación fullstack modular, un solo deploy

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

El sistema es una **única aplicación fullstack con un solo deploy**, organizada
internamente en cinco módulos: `catalogo`, `moderacion`, `aprendizaje`,
`progreso` e `identidad`.

Regla de límite, vinculante: **la capa web no consulta la base de datos; le pide
al módulo.**

## Contexto

Un solo desarrollador. Producto sin validar: no hay usuarios todavía y el
alcance sigue moviéndose. El MVP es un catálogo de lectura más tarjetas de
repaso, quiz y dashboard de progreso.

Dos hechos condicionan el diseño y conviene dejarlos escritos:

1. **Este producto escala por catálogo y por moderación, no por carga.** El
   crecimiento esperado es en cantidad de fichas y en volumen de propuestas a
   revisar, no en peticiones por segundo.
2. Una aplicación mobile fue mencionada explícitamente como posibilidad **a muy
   largo plazo**, sin fecha ni compromiso.

## Problema

Cómo organizar el sistema para no pagar hoy la complejidad de servicios
separados —dos proyectos, dos deploys, un contrato HTTP que mantener— y al mismo
tiempo no quedar atrapado el día que aparezca un segundo consumidor, como una
app mobile.

Dicho de otro modo: dónde poner los límites del sistema, y de qué tipo.

## Alternativas consideradas

### A. API separada + cliente SPA
Backend independiente que expone HTTP, frontend que lo consume. Es la forma que
más naturalmente admite un cliente mobile más adelante.

### B. Monolito modular fullstack
Una sola aplicación. Los módulos son límites lógicos dentro del mismo proceso.
La web llama a los módulos como funciones, no por red.

### C. Microservicios
Un servicio por dominio, desplegados por separado.

### D. Monolito sin módulos
Una sola aplicación sin límites internos: las páginas consultan la base
directamente.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. API + SPA | Mobile ya servido desde el día uno; límite imposible de violar | Dos proyectos y dos deploys para un desarrollador; el modelo de datos y las validaciones se escriben dos veces; latencia y serialización entre capas | Medio |
| B. Monolito modular | Un deploy, una base de código, el modelo escrito una vez; admite un segundo consumidor agregando un adaptador | El límite lo sostiene la disciplina, no la red; se escala en bloque; un fallo afecta a todo | Bajo hacia A: los módulos ya existen, se les agrega una capa HTTP |
| C. Microservicios | Escala y despliegue independientes | Complejidad operativa desproporcionada para un desarrollador y cero usuarios | Alto |
| D. Monolito sin módulos | Lo más rápido de escribir al principio | La lógica queda pegada a las pantallas; mobile obliga a reescribir; la autorización se dispersa y se vuelve imposible de auditar | Alto |

## Decisión elegida

**Alternativa B.** Monolito modular, un solo deploy, cinco módulos con límites
lógicos.

La capa web —páginas, componentes, acciones— **no** accede a la base de datos ni
contiene reglas de negocio. Invoca funciones de módulo. Toda verificación de
autorización ocurre **dentro** del módulo, nunca solo en la interfaz.

## Motivo

**El límite que importa es lógico, no de red.** Separar en procesos distintos no
crea buenos límites: solo los vuelve caros de cruzar. Un límite bien puesto
dentro de un mismo proceso da la misma capacidad de razonar sobre el sistema, y
además se puede convertir en un límite de red después, cuando exista una razón.

La alternativa A es la que más tentaba por el argumento mobile, y es justamente
donde no cierra el intercambio: se paga un costo **cierto y hoy** (dos
proyectos, dos deploys, el modelo duplicado) por un beneficio **incierto y
lejano**. Con B, ese costo se difiere y además se reduce: el día que haya
mobile, los módulos ya están escritos y solo falta el adaptador HTTP que los
expone.

La regla de límite converge, además, con el patrón que la documentación oficial
de Next.js recomienda para autenticación: una capa de acceso a datos en un
módulo `server-only` donde se verifica la sesión y el rol antes de tocar los
datos. Es decir, la autorización vive donde vive el dato, y no puede eludirse
desde la interfaz.

## Consecuencias

**Aceptamos:**
- Un fallo grave afecta a toda la aplicación: no hay aislamiento entre módulos.
- El escalado es en bloque; no se puede escalar un módulo por separado.
- El límite lo sostiene la disciplina del equipo. No hay red que lo imponga,
  aunque marcar los módulos como `server-only` ayuda a detectar violaciones en
  compilación.

**Obtenemos:**
- Un deploy, una base de código, un modelo de datos escrito una sola vez.
- Sin latencia ni serialización entre la interfaz y la lógica.
- La autorización concentrada en el módulo, en un solo lugar auditable.
- Un camino barato hacia mobile: agregar `/api/v1/*` como segundo consumidor de
  los mismos módulos, **sin reescribir nada**.

**Deuda técnica asumida:**
- El adaptador HTTP no existe y no se va a construir hasta que haya un consumidor
  real. Construirlo antes sería mantener una capa de traducción sin usuarios.
  Costo estimado cuando llegue: días, no una migración.

**Revisar si:**
- Aparece un segundo consumidor real (mobile, integración de terceros): ahí se
  escribe el adaptador HTTP, sin cambiar esta decisión.
- Un módulo necesita escalar o desplegarse por separado por una razón medida.
- Entran más desarrolladores trabajando en paralelo sobre módulos distintos y la
  coordinación en un solo repo empieza a doler.
