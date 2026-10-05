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

## 5. Qué entra en `docs/marca/`

- **Decisión (2026-10-04, auditoría de marca y UI):** los documentos de
  `docs/marca/` (sistema de diseño v1 y v2) son el insumo histórico que
  adoptaron los ADR 0008 y 0015, y no se reescriben. Solo reciben dos cosas:
  - **remisiones**: un aviso que apunta al ADR que corrige un punto, como la
    del #165 en v1;
  - **las extensiones ya escritas y marcadas con su ticket**, como la de foco
    y objetivo táctil del #58 en v2 §6, que se quedan donde están.
- **Las extensiones nuevas no van ahí.** Un token, un componente o una regla de
  uso que la marca no traía se escribe en la skill `identidad-argentum`, que es
  la fuente citable de lo vigente.
- **Contexto.** Hoy conviven tres capas: el documento de v1, el de v2 y los ADR
  que los corrigen (0008, 0015, 0028). Si además las extensiones nuevas se
  escriben dentro de los documentos, ya no se distingue qué trajo la marca, qué
  corrigió un ADR y qué agregó el equipo.
- **Motivo.** Cada cosa tiene un solo lugar: lo decidido está en el ADR, lo
  vigente y aplicable en la skill, y el origen en `docs/marca/`.
- **Costo de revertir:** nulo; es una regla de dónde se escribe.
- **Ejecuta:** el `brand-specialist`, al registrar cualquier extensión.

## 6. El prefijo `cat` de los tokens significa *tipo*, y el `provisorio` se va con su condición

- **Decisión (2026-10-04, auditoría de marca y UI):**
  - Los tokens `--color-cat-*` conservan el nombre. `cat` es un nombre heredado
    de v1, que hablaba de «categorías de contenido», y en este proyecto
    significa **tipo** de entidad, el término de `CONTEXT.md`. Ese glosario
    pide evitar «categoría» en el dominio, pero un prefijo de token no es
    vocabulario del dominio.
  - `--color-tarjetas-carta-provisorio` y su par
    `--color-tarjetas-dorado-provisorio` se renombran **cuando cada uno deje
    de ser provisorio**: el sufijo se cae junto con la condición que lo
    justificaba. No se renombran antes.
- **Contexto.** La auditoría marcó los dos nombres como posibles
  inconsistencias.
- **Motivo.** Renombrar `cat` toca clases en varias pantallas sin cambiar nada
  visible ni corregir ningún error. Alcanza con dejar escrito qué significa.
  El sufijo `provisorio` sí dice algo verdadero hoy, y mantenerlo mientras lo
  sea es lo correcto.
- **Costo de revertir:** un buscar y reemplazar.
- **Ejecuta:** el `brand-specialist` registra el significado de `cat` en
  `identidad-argentum`. El renombre de cada token `tarjetas-*-provisorio`
  entra en el ticket que lo saque de provisorio.

## 7. Los conflictos de `development` → `main` los resuelven los agentes; el merge a `main` sigue siendo del usuario

- **Decisión (2026-10-04, pedido del usuario):**
  - Cuando `development` → `main` tiene conflictos, el `delivery-specialist`
    abre `chore/<n>-reconcile-main` desde `development`, mergea `origin/main`
    en ella y convoca al dueño de cada archivo en conflicto para resolverlo.
    Árbol verde, commit con ticket y PR **contra `development`**, con los dos
    portones de siempre. Se mergea con merge commit, no con squash.
  - Con `development` limpio respecto de `main`, el `delivery-specialist` abre
    el PR `development` → `main` (`gh pr create --base main --head development`,
    con confirmación del usuario). Es lo único nuevo que puede hacer contra
    `main`.
  - Siguen siendo del usuario: mergear ese PR a `main` y desplegar. Ningún agente
    pushea ni mergea a `main`.
- **Contexto.** El PR #198 quedó en conflicto en diez archivos. Hay precedente
  de reconciliación a mano (#128, #129, #148). La causa de fondo es que
  `development` se mergeó a `main` con **squash** (`Development (#192)`): `main`
  no quedó como ancestro de `development` y el historial diverge de nuevo cada
  vez.
- **Motivo.** Abrir un PR no cambia producción: no escribe en `main`, no
  despliega y el usuario lo revisa antes de mergear. Por eso no roza los ADR
  0024, 0025 ni 0027 (que gobiernan escrituras en Neon y Vercel de producción),
  y alcanza con esta entrada, sin ADR de proceso (CLAUDE.md, «Regla de proceso
  vigente»). La resolución es del dueño del archivo, no del `delivery-specialist`,
  que no escribe código. Un conflicto entre dos decisiones incompatibles no se
  resuelve: se pregunta.
- **Regla de fondo.** El PR `development` → `main` se mergea con **merge commit,
  no con squash**; el de reconciliación, igual. Es lo que evita que el conflicto
  vuelva.
- **Costo de revertir:** quitar el permiso de la guarda y un párrafo del agente.
  Si el flujo crece (más ramas, más gente), se promueve a ADR.
- **Ejecuta:** `delivery-specialist`; la sesión principal edita `limitar-gh.sh`.
