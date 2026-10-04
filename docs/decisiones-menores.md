# Decisiones menores

Decisiones **chicas y baratas de revertir** que no merecen un ADR (ver los tres
criterios en `adr/README.md`: caras de revertir, sorprendentes sin contexto,
resultado de un trade-off real) pero que, si no se escriben, se discuten de
nuevo cada vez que alguien las roza. Una línea de contexto, la decisión, el
motivo y quién la ejecuta.

Si una entrada crece, o su reversión deja de ser barata, se promueve a ADR.

Las decisiones que se **posponen** viven en `decisiones-pendientes.md`, no acá.

---

## 1. El alias `@/` se borra

- **Decisión (2026-10-02, #158):** se elimina el alias `@/*` de `tsconfig.json`
  (`paths`) y de `vitest.config.mts` (`resolve.alias`). Los imports dentro de
  `src/` son relativos, con extensión (ADR 0011).
- **Contexto.** El alias no tiene un solo uso en `src/`, `contenido/` ni
  `scripts/`. El ADR 0011 ya lo anotaba como deuda (no funciona bajo `node`, y
  la importación del contenido corre bajo `node`) con un disparador que nunca
  se cumplió. El ADR 0016 escribe `@/db/*` y `@/catalogo/*` como **notación** de
  sus reglas; el límite que las hace cumplir es el `no-restricted-imports` de
  `eslint.config.mjs`, que ya está escrito con globs que no dependen del alias.
- **Motivo.** Es configuración que no resuelve ningún problema presente, y deja
  abierta una puerta que el ADR 0011 documenta como ya cerrada: el primer `@/`
  que alguien escriba en la cadena de la importación rompe en ejecución, no en
  compilación. Sin el alias, `tsc` lo rechaza en el momento.
- **Costo de revertir:** dos líneas. Si algún día hace falta, se agrega con su
  caso concreto.
- **Los ADR no se editan.** El 0016 y el 0011 siguen diciendo `@/`; léase como
  notación de ruta, no como alias de resolución. No hace falta un ADR que lo
  supersede: ninguna regla cambia, solo desaparece una declaración sin uso.
- **Ejecuta:** `backend-specialist` (el `delivery-specialist` reparte el ticket).

## 2. La skill del eje 2 del `ui-reviewer` sigue siendo `next-best-practices`

- **Decisión (2026-10-02, #158):** no se cambia el agente. El eje 2 —límites del
  framework: Server y Client Components, convenciones de archivos, APIs
  asíncronas— es territorio de `next-best-practices`, la misma que traen
  precargada `frontend-specialist` y `backend-specialist`. Lo que está mal es la
  frase de `CLAUDE.md`, no el agente.
- **Contexto.** `CLAUDE.md` llama a `vercel-react-best-practices` "*la* fuente
  sobre React y Next.js". Esa skill es de **rendimiento** (cascadas, bundle,
  re-renders), y el propio `frontend-specialist` la invoca solo con una
  medición. Las dos skills no compiten: cubren cosas distintas.
- **Motivo.** El revisor audita límites y correctitud, no rendimiento; darle
  `vercel-react-best-practices` lo empujaría a reportar micro-optimizaciones
  que la regla del proyecto dice no aplicar sin medición.
- **Reparto vigente:** `next-best-practices` para convenciones y límites del
  framework; `vercel-react-best-practices` para rendimiento de React y Next;
  entre ambas y la `react-best-practices` del plugin, gana la de
  `vercel-react-best-practices` en lo que es rendimiento. En todo caso, los ADR
  y `CONTEXT.md` ganan.
- **Ejecuta:** corregir la salvedad de `CLAUDE.md` (ver el informe del #158;
  `CLAUDE.md` queda fuera de `docs/`, lo edita la sesión principal).

## 3. #84 y #92 son notas, no tickets: se cierran

- **Decisión (2026-10-02, #158):** se cierran las dos, con un comentario que
  apunta a dónde quedó cada pregunta. No se reescriben como tickets.
- **#84 (salas del catálogo).** Sus tres preguntas ya tienen respuesta en el
  código y en las reglas existentes:
  1. *Qué devuelve el módulo:* no hace falta una función nueva. La pantalla
     cuenta con `listarPorTipo` (ver el encabezado de
     `src/app/salas-del-catalogo.datos.ts`, ticket #88). El título del issue
     pide "endpoints", que choca con el ADR 0016 Regla 2: no hay HTTP interno.
  2. *Qué identificador cruza la costura:* el discriminador `tipo` de la tabla
     `entidad` (ADR 0001), no el nombre visible. Ya es lo que hace el código.
  3. *Coherencia entre el total del hero y la suma de las salas:* si ambos
     salen de las mismas llamadas a `listarPorTipo`, no pueden desincronizarse.
     **No verificado** que el hero hoy lo haga; es un chequeo para quien cierre
     el #88, no una decisión.
  Lo único de producto que queda abierto (cómo se muestra una sala sin fichas)
  ya tiene su respuesta provisoria en el código: cero honesto. Lo decide el
  usuario si le molesta, no hace falta un ticket para eso.
- **#92 (mazo de repaso).** Es la misma pregunta que `decisiones-pendientes.md`
  §2 (dónde se registra una respuesta y a quién pertenece) y §4 (el contrato de
  `aprendizaje`, incluido cómo se arma el mazo). Mantenerla abierta duplica esas
  entradas y la vuelve a escribir sin disparador. Su contenido ya está en §4,
  que ahora la cita como origen.
- **Por qué cerrar y no reescribir.** Un ticket es una rebanada que alguien
  puede tomar y terminar. Ninguna de las dos lo es: la una ya está hecha y la
  otra depende de un módulo que no existe y de decisiones que nadie tomó. Un
  issue abierto con la etiqueta `question` que dice "esto no es un ticket" es
  ruido en el tracker.
- **Señal para retomar #92:** el arranque de la rebanada de `aprendizaje`
  (disparador de §4); ahí nace el ticket real, con el contrato diseñado.
- **Ejecuta:** `delivery-specialist`, sobre el tracker (ver el informe del #158).

## 4. Cuatro skills de flujo git/GitHub para el `delivery-specialist`

- **Decisión (2026-10-03):** se crean `abrir-rama`, `commitear-con-ticket`,
  `publicar-issues` y `publicar-pr` en `.claude/skills/`. Son procedimientos
  cortos que remiten a `convenciones-git` y a `docs/agents/issue-tracker.md`;
  no repiten sus reglas.
- **Excepción a la regla de proceso vigente** (no crear skills de proceso hasta
  #30): la pidió el usuario. No sienta precedente.
- **Motivo.** El `delivery-specialist` pesa unas 35 KB y las secciones 7, 8, 9 y
  9-bis de ese archivo son procedimiento. En una skill se carga solo cuando se
  usa, y no se precarga en el frontmatter del agente.
- **Costo de revertir:** borrar cuatro carpetas.
- **Pendiente:** recortar esas secciones del agente y dejar un puntero a la
  skill. Es un cambio aparte, porque toca el archivo de un agente.
- **Ejecuta:** sesión principal.
