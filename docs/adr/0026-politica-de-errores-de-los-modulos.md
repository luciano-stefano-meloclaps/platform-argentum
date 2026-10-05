# 0026 — Política de errores de los módulos: ausencia, resultado y excepción

- **Estado:** Aceptado. Cierra la entrada §1 de
  [`docs/decisiones-pendientes.md`](../decisiones-pendientes.md), cuyo disparador
  se cumplió con el módulo `identidad` ([ADR 0019](0019-modulo-identidad-con-better-auth.md)).
- **Fecha:** 2026-10-02
- **Decide:** el `super-architect`, por delegación explícita del usuario
  («decidan entre los agentes»), tras la auditoría de coherencia de 2026-10-01.

## Decisión

Una función de la interfaz de un módulo (`src/<modulo>/<modulo>.ts`) comunica
que no pudo hacer lo que le pidieron de **tres maneras, según quién causó el
fallo**:

1. **Ausencia esperada → `undefined`.** Lo que se buscó no existe y eso es un
   resultado normal: `obtenerPorSlug` de un slug inexistente. La firma lo dice
   (`Promise<Entidad | undefined>`) y el llamador decide (en la capa web,
   `notFound()`).
2. **Decisión del usuario → resultado discriminado.** La entrada de una persona
   no se puede aceptar: formato inválido, credencial incorrecta, email ya
   registrado, una propuesta que no cumple el descriptor. La función **no
   lanza**: devuelve

   ```ts
   { ok: true, ...datos } | { ok: false, mensaje: string, campo?: string }
   ```

   `mensaje` está en español y listo para mostrar; `campo` nombra el campo del
   formulario al que corresponde, si corresponde a uno. Los mensajes salen de
   un diccionario dentro del módulo, nunca del texto de una librería.
3. **Fallo del programa, del contenido curado o de una dependencia →
   excepción.** Una base caída, un error de Better Auth que el diccionario no
   anticipa, contenido que no cumple su descriptor en la importación. Se deja
   propagar; no se envuelve en un resultado.

El criterio que separa 2 de 3 es la regla interina que ya regía: **una
excepción señala un fallo del programa o del contenido, no una decisión del
usuario.**

## Contexto

`decisiones-pendientes.md` §1 postergó esta decisión hasta «la primera función
de módulo que reciba entrada de un usuario y necesite una rama recuperable»,
pensando en la rebanada de moderación. Llegó antes, con `identidad`:
`registrarse`, `iniciarSesion` y `cerrarSesion` devuelven
`{ ok: true } | { ok: false, mensaje, campo? }`
(`src/identidad/identidad.ts`, tipo `Resultado`), y propagan como excepción lo
que no es un error de Better Auth reconocido. `catalogo` ya usaba `undefined`
para «no encontrado». La política existía en el código, sin ADR, contra lo que
pedía la propia entrada («el ADR se escribe antes»).

## Problema

Los tres módulos que faltan (`moderacion`, `aprendizaje`, `progreso`) reciben
entrada de usuarios. Sin una regla escrita, cada uno elige la suya, y la capa
web termina con tres formas de mostrar un error.

## Alternativas consideradas

### A. Formalizar lo que ya hace `identidad`
Las tres maneras de arriba.

### B. Excepciones tipadas para todo
Una clase de error por caso (`CredencialInvalida`, `EmailRegistrado`), atrapada
en la Server Action. El tipo de retorno no avisa qué puede fallar, y un error de
usuario sin atrapar termina en la pantalla de error genérica.

### C. Resultado para todo, incluidos los fallos del programa
Ninguna función lanza nunca. Obliga a envolver cada fallo de infraestructura
en un valor que ningún llamador sabe tratar, salvo reenviándolo.

### D. Seguir sin decidir
Ya no es posible: el disparador se cumplió.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| **A** | Ya está implementada y probada; el error de usuario figura en el tipo de retorno | Dos mecanismos (valor y excepción) que hay que saber separar | Bajo mientras haya un solo módulo con entrada de usuario |
| B | Un solo mecanismo | El tipo no documenta los fallos; fácil olvidar atrapar uno | Medio |
| C | Todo explícito en el tipo | Ruido en cada llamada; los fallos del programa se tratan como si fueran del usuario | Medio |

## Decisión elegida

**A**, para los cinco módulos.

## Motivo

Es la opción más simple que ya funciona: no hay que tocar código, y el criterio
que separa los dos mecanismos es el mismo que regía como regla interina, así
que ningún módulo existente la viola. El resultado discriminado hace que el
error de usuario sea parte de la interfaz del módulo, que es lo que es: algo que
el llamador tiene que manejar. La excepción queda para lo que el llamador no
puede arreglar.

## Consecuencias

**Aceptamos:**
- Dos mecanismos conviven, y el que escribe una función del módulo decide en
  cuál cae cada fallo con el criterio de arriba.
- `ok: false` no lleva un código de error, solo `mensaje` y `campo`. Si un
  llamador necesita ramificar por tipo de error, ese día se agrega un `codigo`.

**Obtenemos:**
- Una sola forma de mostrar errores de usuario en toda la capa web.
- El tipo de retorno documenta que la función puede rechazar la entrada; para
  leer los datos de un `ok: true`, el compilador obliga a revisar `ok` antes.

**Revisar si:**
- Un llamador necesita distinguir entre dos errores de usuario para hacer algo
  distinto que mostrar el mensaje.
- Un segundo módulo con entrada de usuario (`moderacion`) no encaja en la
  forma: se revisa antes de su primera función, no durante.
