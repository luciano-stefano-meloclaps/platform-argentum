# 0010 — Los agentes pueden escribir en Vercel, siempre bajo confirmación

- **Estado:** Aceptado
- **Fecha:** 2026-09-07
- **Decide:** Luciano Melo Claps

## Decisión

Los agentes que corren dentro de este proyecto **pueden ejecutar comandos de
escritura contra Vercel** (`deploy`, `env add/rm`, `promote`, `rollback`,
`env pull`, etc.), pero ninguno lo hace en silencio: cada comando de ese tipo
pasa primero por una confirmación explícita del usuario, con el comando exacto
y el motivo a la vista. Esto **supersede** la parte de la política operativa
fijada en el ticket #7 y reflejada en el [ADR 0006](0006-infraestructura-vercel-neon.md)
que decía *"ningún agente tiene credenciales de Vercel, ni debería"*.

## Contexto

El ticket #7 (rebanada 0, despliegue inicial) fijó como regla operativa que
desplegar es una acción exclusiva del usuario y que ningún agente debía tener
capacidad de escritura contra Vercel. Esa regla se implementó como un bloqueo
duro en `.claude/hooks/limitar-vercel.sh`: cualquier subcomando de escritura se
deniega, sin excepción, para cualquier subagente.

Con el plugin `vercel@claude-plugins-official` habilitado (todo-o-nada: trae los
tres agentes que se usan más `/deploy`, `/bootstrap` y `/env`), esa decisión fue
la que permitió adoptar el plugin sin exponer credenciales de escritura por
accidente.

El usuario pidió ahora que los agentes **sí puedan actuar**, pero avisando qué
van a hacer y pidiendo confirmación antes de ejecutarlo — no un bloqueo previo
sin posibilidad de aprobar en el momento.

## Problema

El bloqueo duro no distingue entre "el agente propone algo razonable que el
usuario aprobaría al toque" y "el agente está por hacer algo indeseado": en
ambos casos, deniega y el agente tiene que terminar el turno pidiendo que el
usuario lo ejecute él mismo a mano. Eso es más fricción de la que el usuario
quiere pagar para casos legítimos (por ejemplo, que `deployment-expert`
proponga y ejecute un rollback puntual con el visto bueno inmediato del
usuario).

## Alternativas consideradas

### A. Mantener el bloqueo duro (`deny`)
Statu quo: cero acción de agente contra Vercel, siempre a mano del usuario.

### B. Permitir todo sin preguntar
Quitar el hook para comandos de escritura y confiar en que el agente use
buen juicio.

### C. Bloqueo duro solo para `env pull`, confirmación (`ask`) para el resto
Punto intermedio: todo lo que no sea bajar secretos al disco pasa a pedir
confirmación; `env pull` sigue prohibido siempre.

### D. Confirmación (`ask`) para todo, incluido `env pull`
Ningún comando de escritura queda bloqueado de antemano; todos pasan por
confirmación explícita del usuario en el momento, incluida la materialización
de variables de entorno en disco.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Bloqueo duro | Cero riesgo de una escritura no deseada | El usuario tiene que ejecutar todo a mano, incluso lo trivial | Bajo |
| B. Sin preguntar | Cero fricción | Un agente puede desplegar o pisar una variable de entorno sin que el usuario lo vea venir | Alto: hay que confiar en que nunca pasó nada indeseado |
| C. `ask` salvo `env pull` | Confirmación real para todo lo reversible; conserva el bloqueo duro donde el daño es "credenciales de producción en un disco que después hay que limpiar" | Una regla con una excepción que hay que recordar | Bajo |
| D. `ask` para todo | Una sola regla, sin excepciones | Un `env pull` aprobado sin pensar dos veces dos veces dos veces materializa secretos de producción en el árbol de trabajo | Bajo |

## Decisión elegida

**Alternativa D.** Todo comando de escritura contra Vercel —incluido
`env pull`— pasa por `permissionDecision: "ask"` en lugar de `"deny"`. El hook
sigue teniendo la única fuente de la verdad: la lista blanca de comandos de
lectura sigue funcionando sin preguntar; todo lo que no es lectura pasa a
preguntar, uniformemente.

## Motivo

El usuario lo pidió explícitamente y con esa alternativa exacta al responder la
pregunta de si `env pull` debía quedar como excepción: *"pasa a preguntar
también"*. Uniformar la regla evita que alguien tenga que recordar cuál era la
única excepción — la alternativa C exigía justo eso.

El riesgo real de `env pull` (secretos de producción escritos a disco) no
desaparece, pero deja de ser un bloqueo ciego: el usuario ve el comando exacto
antes de que se ejecute y decide con la información completa, igual que con
cualquier otro comando de escritura.

## Consecuencias

**Aceptamos:**
- El usuario tiene que estar presente y atento para aprobar cada comando de
  escritura contra Vercel; si aprueba sin leer, el mecanismo no protege nada.
- `env pull`, si se aprueba, sigue materializando credenciales de producción en
  el árbol de trabajo — la confirmación no cambia esa consecuencia, solo la
  hace explícita.

**Obtenemos:**
- Los tres agentes del plugin de Vercel dejan de ser solo consultivos: pueden
  ejecutar lo que proponen, con el usuario aprobando en el momento.
- Menos fricción para acciones legítimas (rollback puntual, promoción de un
  deploy) sin volver a la alternativa B (sin ningún control).

**Deuda técnica asumida:**
- Ninguna nueva: el mecanismo de confirmación es el que ya provee Claude Code
  para cualquier comando de Bash fuera de la lista blanca; no se construyó
  infraestructura propia.

**Revisar si:**
- Se observa que las confirmaciones se aprueban de forma automática o sin
  leerlas (por ejemplo, en un modo de sesión sin supervisión) — en ese caso
  `ask` funciona igual que `allow` y la protección real desaparece.
- Se agrega un agente de despliegue con alcance de producción recurrente, donde
  la fricción de confirmar cada vez deje de tener sentido y convenga un modo
  distinto (por ejemplo, aprobación por lote o por ventana de tiempo).
