# platform-argentum

Contexto de proyecto para Claude Code. Este archivo se carga automáticamente en
cada sesión y en cada subagente, así que se mantiene corto y factual.

## Estado actual

**El arranque ya está hecho: el proyecto compila, corre y está desplegado.** La
arquitectura y el stack están decididos y documentados en `docs/adr/`.

Lo que existe hoy en el árbol:

- Esqueleto de Next.js 16 con Tailwind v4, ESLint 9 y Vitest.
- PostgreSQL 18 local en Docker (`docker-compose.yml`), la base gestionada en
  Neon y la aplicación desplegada en Vercel.
- Tabla `entidad` con su primera migración, en `drizzle/`.
- El **registro de descriptores** y el descriptor de `procer`, en
  `src/catalogo/descriptores/`, con la columna `datos` tipada por él.

Lo que **todavía no existe**: ninguno de los cinco módulos, ninguna pantalla más
allá de la de arranque, y el directorio `contenido/`. La primera rebanada de
producto —la ficha de un prócer, de archivo a pantalla— ya está cortada y
publicada en el tracker.

**El árbol se entrega verde.** Estos son los comandos que verifican una entrega,
y quien termina un ticket los corre antes de decir que terminó:

```bash
pnpm typecheck   # next typegen && tsc --noEmit
pnpm lint        # eslint .
pnpm test        # vitest run
```

`pnpm build` cuando el ticket toque el build; `pnpm db:generate` y
`pnpm db:migrate` cuando toque el esquema.

**Producto.** Catálogo sobre Argentina para aprender: fichas (próceres,
monumentos, animales, comida, fechas patrias…), tarjetas de repaso, quiz
individual y panel de progreso. Más adelante: cuentas, y propuestas de usuarios
con moderación.

**Audiencia y voz (ADR 0012).** El lector son **chicos grandes y adultos**, de
doce años en adelante, y la prosa del catálogo es **épica, de registro alto**:
escenario dramático, período amplio, léxico rico y metáfora sostenida. **No se
simplifica y no se baja de tono.** La regla verificable vive en la skill
`voz-narrativa`, calibrada contando las muestras del usuario. Una **versión para
chicos** —otra lengua y quizás otro diseño— está **pospuesta, no cancelada**, con
su disparador y su regla interina en `docs/decisiones-pendientes.md`.

Ese cambio es reciente y **queda documentación vieja**: el `README.md` y las
secciones de audiencia del `frontend-specialist`, el `ui-reviewer`, el
`brand-specialist` y la skill `revision-de-ui` todavía dicen «lo usan chicos de
ocho años». Sus **requisitos** siguen vigentes —contraste AA, objetivos táctiles,
`prefers-reduced-motion`, el color como no-único portador de significado—; lo que
envejeció es la justificación. Igual que el ADR 0008, cuyos valores no se tocan y
cuya sección 8 quedó sin objeto.

**Stack decidido:** Next.js 16 · React 19 · TypeScript · PostgreSQL · Drizzle
ORM · Zod · Tailwind v4 · Vitest (ADR 0003 y 0005). Despliegue en Vercel, base
en Neon, PostgreSQL local en Docker (ADR 0006). Better Auth **recién** cuando
lleguen las cuentas: el MVP no tiene cuentas.

**Arquitectura decidida:**

- Monolito modular, un solo deploy, cinco módulos: `catalogo`, `moderacion`,
  `aprendizaje`, `progreso`, `identidad` (ADR 0002).
- **Regla de límite:** la capa web no consulta la base de datos; le pide al
  módulo. La autorización se verifica dentro del módulo, nunca solo en la
  interfaz.
- **La capa web es hexagonal (puertos y adaptadores) y se organiza con MVVM**
  (ADR 0016, recuperado y renumerado — no confundir con el ADR 0015, que es la
  identidad visual v2). La vista-modelo es una **función pura del servidor**,
  nunca una clase con estado ni un hook; `src/catalogo/index.ts` es la única
  superficie de importación del módulo, con **tres** funciones
  (`listarPorTipo`, `obtenerPorSlug`, `listarSlugs`); no hay `/api` interno
  hasta que exista un segundo consumidor real; y la ficha se prerenderiza
  (`dynamicParams = false`), sin `cacheComponents`. El **puerto de salida**
  —que `catalogo` declare una interfaz de persistencia intercambiable en vez
  de usar Drizzle directo— queda **explícitamente fuera de este ADR**: lo
  decide el arquitecto con `backend-specialist` y `database-specialist`,
  ticket #60, todavía sin resolver.
- Catálogo: una sola tabla `entidad` con discriminador `tipo` y columna `datos`
  JSONB; los campos de cada tipo viven en descriptores en código (ADR 0001).
- **Una entidad es una fila con un solo slug** (ADR 0013). El **registro de
  lectura** —épico o para chicos— es un **parámetro de lectura**, no parte de la
  identidad: nunca una columna de `entidad`, nunca una segunda fila, nunca un
  segundo slug. Cuando llegue la versión para chicos, las dos prosas van dentro
  de `datos`; **los hechos no se duplican jamás**. Hoy **no se toca nada**: ni
  columna, ni campo `*Chicos`, ni registro en la ruta.
- Contenido curado en archivos versionados, importado a la base (ADR 0004), en
  `contenido/<tipo>/<slug>.ts` y tipado por el descriptor de su tipo (ADR 0009).
- **Severidad del compilador cerrada** (ADR 0007): `strict` más
  `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, `verbatimModuleSyntax`,
  `noImplicitReturns` y `noFallthroughCasesInSwitch`. Están en `tsconfig.json`
  con un comentario cada una: **no se aflojan para que compile algo**, se
  resuelve el código. Lo mismo vale para el linter: **todo import de valor
  lleva su extensión** —`./boton.tsx`, `@/catalogo/descriptores/registro.ts`—
  y los `import type` **no** la llevan (ADR 0011). Si `pnpm lint` marca
  `import/extensions`, la regla es deliberada: se corrige el import, nunca la
  regla.
- **Identidad visual decidida, en dos documentos que se leen juntos.** La
  marca **Argentum** está cerrada y versionada en `docs/marca/sistema-de-diseno.md`
  (v1.0, ADR 0008) y `docs/marca/sistema-de-diseno-v2.md` (giro museístico,
  ADR 0015, que **supersede parcialmente** al 0008). v2 reemplaza el
  concepto/encuadre (de "no gubernamental" a "monumento estatal"), el
  logotipo, la paleta de celeste/dorado/error y la tipografía: **Lora
  reemplaza a Montserrat en todo el sistema**, no solo en el cuerpo de
  lectura de ficha — con riesgos de legibilidad a tamaño chico y de
  `tabular-nums` documentados y sin resolver por adelantado en el ADR 0015 y
  en la skill `identidad-argentum`. **No cambian**: el sistema de ligas, la
  paleta de 6 categorías, el verde laurel, los íconos ni la carga de
  fuentes — siguen en v1/ADR 0008. **No se propone paleta ni tipografía: ya
  están elegidas.**

**Antes de contradecir cualquiera de estos puntos, leé el ADR correspondiente.**
Si una decisión cambia, se escribe un ADR nuevo que supersede al anterior; no se
edita el viejo.

## Flujo de trabajo

El proyecto avanza **por rebanadas y con ticket**. Un alcance aprobado se corta
en rebanadas, cada una se publica como issue de GitHub, y **nada entra al
historial sin un ticket que lo explique**. No se codifica a lo grande: se
codifica por partes chicas, trazables y reversibles.

El equipo tiene **tres niveles**, y cada uno decide una cosa distinta:

```
                 super-architect        qué se construye y por qué
                        │
                delivery-specialist     en cuántos pedazos, quién lo hace
                        │               y qué entra al historial
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
  backend-          frontend-         database-      cómo se resuelve
  specialist        specialist        specialist
      │                 │
 ┌────┴────┐   ┌────────┴────────┐
 ▼         ▼   ▼                 ▼
narrative- historiador- brand-  ui-reviewer  ← equipos de área
specialist specialist   specialist
```

Fuera de la jerarquía, transversal y a demanda: `typescript-specialist`.

El ciclo de una rebanada, de punta a punta:

```
requerimiento  → arquitecto:    alcance, ADR
               → entrega:       corte en rebanadas → APROBACIÓN → issues
               → entrega:       reparte UN ticket
               → especialista:  escribe el código, deja el árbol, termina
               → entrega:       verifica contra el ticket → commit → comenta
               → usuario:       verifica el commit → entrega: push + PR a development
               → usuario:       verifica el PR → entrega: merge a development → se cierra el ticket
               → usuario:       mergea development a main y despliega, cuando quiere
```

`main` dejó de ser la rama a la que se publica. Desde ahora existe una rama
**`development`**, y es ahí donde llega el trabajo con ticket: el
`delivery-specialist` pushea la rama de la rebanada y abre el PR contra
`development` —nunca contra `main`—, y lo mergea, siempre con la verificación
explícita del usuario en cada uno de los dos pasos (push y merge son portones
distintos, ver `.claude/agents/delivery-specialist.md`). Mergear `development`
a `main` y desplegar sigue siendo enteramente del usuario, en su propio tiempo.

### Nivel 1 — Arquitectura

El diseño y el análisis funcional pasan por el agente **`super-architect`**
(`.claude/agents/super-architect.md`), que actúa como arquitecto principal y
analista funcional. Entiende el producto y define el alcance antes de decidir
cómo construirlo.

Invocación:

```bash
claude --agent super-architect     # como sesión principal (recomendado:
                                   # puede conversar y preguntar directamente)
```

O desde una sesión normal, mencionándolo: `@agent-super-architect` o pidiendo
que se delegue en él.

**Delega por defecto.** Averiguar —leer un archivo largo, verificar un hecho
contra el repositorio o el compilador, redactar un artefacto extenso— se lo pide
a un especialista y se queda con la conclusión. Decidir, escribir el ADR, fijar
el alcance y sostener la coherencia entre áreas no se delegan nunca. El motivo
es concreto: es el único agente que tiene que sostener la visión del sistema
completo durante toda la conversación, y cada archivo que abre para confirmar un
detalle le come el espacio donde vive esa visión.

### Nivel 2 — Entrega

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `delivery-specialist` | El corte en rebanadas, los tickets, las ramas, el reparto, **todos los commits del trabajo con ticket** y el push + PR + merge contra `development` | Código, alcance, decisiones de producto, `main` |

**No es dueño de ningún archivo del árbol de trabajo, y justamente por eso puede
ser dueño del historial** —que hasta ahora era el único artefacto con cuatro
escritores y ningún dueño—. Está por encima de los tres especialistas en dos
sentidos concretos y solo esos dos: **les reparte los tickets** y **es la puerta
de salida de su trabajo**. Adentro de su área, el criterio técnico sigue siendo
del especialista.

**El commit dejó de ser de los especialistas**, y es un cambio a lo que decía
antes este archivo. El motivo: el que escribió el código es la peor persona para
juzgar si el diff tiene una sola intención —ya se convenció de que ese arreglito
de paso "va con esto"—, que es el mismo argumento por el que existe el
`ui-reviewer`. Y una rebanada cruza tres dueños por definición, así que
"commitea el que termina último" significa que uno barre el trabajo de los otros
dos sin entenderlo. La regla:

> **Si el trabajo tiene ticket, lo commitea el `delivery-specialist`. Si no
> tiene ticket, no debería estar pasando.**

Eso le sale barato por una razón que hace que la idea funcione: **el ticket es la
intención**, así que no tiene que adivinar qué quiso hacer el que escribió, lo
lee. Con una excepción deliberada: **la sesión principal y el arquitecto
commitean solos**; documentación, ADR y configuración están fuera del circuito de
tickets a propósito.

Sus límites de herramientas, todos deliberados:

- **Sin `Write` ni `Edit`** — no es dueño de ningún archivo, y un agente que
  puede editar lo que está por commitear deja de verificar y empieza a arreglar,
  metiendo en el diff un cambio que nadie pidió ni revisó. *Disparador para
  revisarlo: si el tracker pasa a ser markdown local bajo `.scratch/`, se le da
  `Write` acotado ahí.*
- **Con `Bash`**, porque `git` y `gh` son toda su herramienta. Lo usa para
  commitear, pushear la rama de la rebanada, abrir y mergear el PR contra
  `development`, y consultar — **nunca para escribir archivos**: un `cat >` o
  un `sed -i` rompe el límite de arriba y encima contamina el commit que está
  por hacer.
- **Con `Agent` sobre los tres especialistas**, porque sin eso "estar por
  encima" no significaría nada. Reparte **un ticket por vez**: dos especialistas
  sobre el mismo árbol producen un diff que después no se puede separar en dos
  commits.
- **Sin `WebFetch`, `WebSearch` ni Context7** — nada de lo que hace depende de la
  versión de una librería, y `gh --help` y el repositorio alcanzan.

**Puede crear issues en el repositorio real.** Es una excepción explícita a
"publicar lo decide el usuario", y se sostiene en que un issue es barato y
reversible y en que **el corte se aprueba antes de publicarse**, así que el
portón humano existe igual.

**También puede pushear y publicar el PR de una rebanada, y es la segunda
excepción a esa misma regla.** Se sostiene en el mismo portón humano, aplicado
dos veces: no pushea sin que el usuario verifique el commit, y no mergea sin
que el usuario apruebe el PR (sección 9-bis de su propio archivo). El límite
duro es `development`: puede pushear cualquier rama menos `main`, y `gh pr
create` sin `--base development` explícito se deniega —el default de `gh` es
el branch por defecto del repositorio, que sigue siendo `main`—. Todo lo demás
lo impide un hook (`.claude/hooks/limitar-gh.sh`): nada de `gh repo`,
`gh release`, `gh label create` ni `gh api` de escritura, para ningún
subagente, y `git push` contra `main` sigue bloqueado para todos, sin
excepción (`.claude/hooks/bloquear-git-push.sh`).

**Etiquetas: solo las diez que trae GitHub por defecto.** No hay vocabulario
propio, y la skill `triage` no está instalada, así que no se aplica
`ready-for-agent` ni el resto de su vocabulario canónico. Antes de usar
`--label`, verificá con `gh label list`: con una etiqueta inexistente el comando
falla, y crearlas está denegado para los subagentes. Una etiqueta nueva la crea
la sesión principal o el usuario, a pedido.

Las dependencias entre tickets van como texto (`Bloqueada por: #12`), no con la
API nativa de GitHub, que necesitaría escrituras y los ids internos de cada
issue.

### Nivel 3 — Especialistas de área

La implementación la hacen tres especialistas, en `.claude/agents/`:

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `backend-specialist` | Los cinco módulos, contratos, autorización, validación, y el contenido curado de `contenido/` con su importación | Esquema, migraciones, interfaz |
| `frontend-specialist` | Pantallas, componentes, estilos, accesibilidad | Base de datos, lógica de negocio |
| `database-specialist` | Esquema, migraciones, índices, entornos de base | Lógica de negocio, interfaz |

Claude puede delegarles solo, o se los invoca con `@agent-<nombre>`.

#### Equipo de backend

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `narrative-specialist` | La **voz** de la prosa del catálogo y su redacción: el contexto, la semblanza, el resumen y las fuentes de cada ficha de `contenido/` | Los hechos, el descriptor, los campos estructurados, `src/`, la interfaz |
| `historiador-specialist` | Investigar y contrastar fuentes sobre los hechos de una ficha, y detectar cuándo un tema entra en disputa política vigente | Escribir prosa, decidir qué entidades entran, cualquier archivo del árbol |

**No es par** de los tres especialistas: trabaja dentro del área del
`backend-specialist`, que es el dueño de `contenido/`, y lo convoca él. Es el
mismo patrón que el `brand-specialist`, y por el mismo motivo: **es un custodio
de algo cerrado y versionado** —ahí la identidad Argentum, acá la voz, escrita
en la skill `voz-narrativa` con sus muestras adentro del repositorio—.

Sus límites de herramientas, todos deliberados:

- **Con `Write` y `Edit`, acotados por regla a `contenido/<tipo>/<slug>.ts` y a
  sus campos de prosa.** La prosa es su artefacto, y hacerla pasar por el
  copiado y pegado de otro agente es donde se pierde una tilde, un salto de
  línea o una raya de inciso sin dejar rastro: una errata de tipos la ve el
  compilador, una de prosa no la ve nadie. El acotamiento es de conducta, no de
  sistema, igual que el del arquitecto sobre `docs/`.
- **Con `Bash`**, y solo para verificar: la prosa vive en un *template literal*
  de TypeScript (ADR 0009), así que una comilla invertida o un `${` en el texto
  rompen el build, y quien lo rompe tiene que poder correr `pnpm typecheck`.
  Nunca para escribir archivos ni para commitear.
- **Sin `WebFetch` ni `WebSearch`**, y es su límite más importante, sin cambios
  desde el ADR 0014. Un narrador con acceso a la web deja de ser narrador y pasa
  a investigador, y el resultado previsible es el peor que este rol puede
  producir: **prosa excelente alrededor de un hecho falso**, que nadie nota
  porque suena bien. **Los hechos los entrega el usuario o el
  `historiador-specialist`**; ninguno de los dos los narra, y la exactitud
  histórica sigue siendo, en última instancia, responsabilidad del usuario —el
  visto bueno explícito sobre cada ficha sigue siendo suyo—, igual que los
  derechos de imagen.
- **Sin `Agent`**, como el revisor y el de marca: lo convocan, no convoca.
- **Sin Context7** — nada de lo que hace depende de la versión de una librería.

**El registro lo fija el ADR 0012 y es el alto.** Las muestras del usuario, que
están versionadas en `.claude/skills/voz-narrativa/muestras.md`, son **el
destino**: se escribe como ellas, no parecido a ellas. Un solo registro para toda
la ficha —el único campo que baja es el `resumen`, que es una etiqueta de listado
y no narración—.

Dos consecuencias que arrastra y conviene tener presentes: **la semblanza
publicada de `contenido/procer/manuel-belgrano.ts` está en el registro viejo y
hay que reescribirla**, y **el criterio de aceptación del ticket #30 —«redactado
para chicos»— quedó falso** y lo corrige el `delivery-specialist` cuando el
usuario se lo lleve.

**`historiador-specialist` (ADR 0014).** Igual que el narrador, **no es par**
de los tres especialistas: trabaja dentro del área del `backend-specialist`, y
lo convoca él. Se activa en tres casos, y solo en esos tres: el usuario lo pide
explícitamente, el tema cae en la lista acotada de disputas políticas de
`voz-narrativa`, o el narrador señala —vía `backend-specialist`— que le falta
un dato. Entrega un **dossier** —hechos, fuentes, y posturas en disputa cuando
corresponde— y **nunca narra ni decide qué entidades entran**.

Sus límites de herramientas, también deliberados:

- **Con `WebFetch` y `WebSearch`**, al revés que el narrador: es exactamente
  la separación que motiva su existencia. Investigar y narrar en el mismo turno
  del mismo agente reintroduciría el riesgo de prosa persuasiva sobre un hecho
  no verificado; separarlos deja el dossier como punto de revisión intermedio.
- **Sin `Write` ni `Edit`**, como el `ui-reviewer` y el `typescript-specialist`:
  su artefacto es el dossier de su informe, no un archivo del árbol.
- **Sin `Bash`**: no compila ni verifica código, así que no lo necesita.
- **Sin `Agent`**: lo convocan, no convoca.

**La neutralidad ante disputas políticas** es una regla de redacción, no de
investigación, y por eso vive en `voz-narrativa` (sección 7) y no en la skill
propia del historiador, `investigacion-historica`. El historiador detecta la
disputa y documenta las posturas con sus fuentes; el narrador escribe el
contrapunto sin tomar partido. El hecho duro se narra igual que siempre —la
regla no suaviza nada—: se puede, por ejemplo, nombrar a Montoneros como lo que
fue, una organización guerrillera, porque es un hecho, no una interpretación.

#### Equipo de frontend

El `frontend-specialist` planificó y creó su propio equipo. **No son pares** de
los otros dos especialistas: trabajan dentro de su área y los convoca él.

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `brand-specialist` | La identidad **Argentum**: marca, logotipo, texturas, paleta, tipografía, contraste y tokens `@theme` | Páginas, componentes, base de datos |
| `ui-reviewer` | Auditar una pantalla terminada contra `revision-de-ui`, ADR 0002 y `CONTEXT.md` | **No escribe ni corrige: reporta** |

Dos límites de herramientas que son deliberados: el revisor no tiene `Write`,
`Edit` ni `Bash` —quien revisa no arregla—, ni `WebFetch`/`WebSearch`, porque la
copia versionada de las guidelines ya está en el repo y no se baja de internet.
El de marca tampoco tiene `Bash`, así que no puede commitear.

**Qué pueden hacer solos:** escribir código en su área, invocar skills, convocar
a otro especialista o al arquitecto con `Agent`, y preguntarle al usuario
mandándole un mensaje a `main` con `SendMessage` sin cortar el trabajo. Terminan
**dejando el árbol de trabajo listo** y diciendo qué cambiaron y contra qué
ticket.

**Qué no pueden:** **commitear** —eso es del nivel 2—, `git push` —bloqueado por
un hook para todo subagente que no sea el `delivery-specialist`, ver abajo—,
escribir en el remoto con `gh`,
cambiar una decisión ya tomada, instalar dependencias o contradecir un ADR. Eso
se propone y se espera. **Ninguno de ellos declara `AskUserQuestion`**: si algo
los bloquea de verdad, terminan el turno con las preguntas escritas. El único
que la declara es el arquitecto, y es para cuando corre como sesión principal
(`claude --agent super-architect`); delegado como subagente pregunta igual que
los demás, terminando el turno.

Salvedad sobre "qué pueden hacer solos": no vale para todos. El `ui-reviewer`,
el `typescript-specialist` y el `historiador-specialist` no escriben archivos.
El `brand-specialist`, el `ui-reviewer`, el `narrative-specialist` y el
`historiador-specialist` **no tienen `Agent`**: los convocan, no convocan. Y
**ninguno commitea**: desde que existe el nivel 2, el historial tiene un solo
dueño.

#### Transversal

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `typescript-specialist` | La dimensión de tipos: severidad del compilador, modelo de tipos del descriptor, tipos que cruzan una costura, `z.input` vs `z.output`, pruebas de tipos | **No escribe archivos: diseña y reporta.** Interiores ajenos, accesibilidad, lógica de negocio, esquema |

**No es un cuarto especialista.** No es dueño de ningún archivo y no implementa:
todos escriben TypeScript, así que su territorio no es el lenguaje sino la
dimensión de tipos, y sobre todo **lo que ningún dueño ve desde su lado porque
vive entre dos**. Lo convocan los tres especialistas y el arquitecto; él no
convoca a nadie. Su límite: *un tipo que vive de un solo lado es del dueño de ese
lado; un tipo que tienen que entender dos dueños es suyo*.

Sus límites de herramientas, todos deliberados:

- **Sin `Write` ni `Edit`** — casi todo lo que tocaría es de otro, y un arreglo
  de tipos rara vez es solo eso: en un módulo es un cambio de contrato, en una
  pantalla es una decisión de producto. Entrega el tipo exacto listo para pegar y
  lo aplica el dueño. *Disparador para revisarlo: si el cuello de botella
  resulta ser que no puede escribir las pruebas de tipos, se le da `Write`
  acotado a `**/*.test-d.ts`.*
- **Con `Bash`**, al revés que el `ui-reviewer`: su verdad de referencia es la
  salida del compilador, y un especialista en tipos que no puede correr
  `tsc --noEmit` es un comentarista. Lo usa para compilar y leer, no para
  escribir ni commitear.
- **Sin `WebFetch` ni `WebSearch`** — Context7 y el compilador cubren lo que
  necesita; buscar en la web sobre tipos devuelve blogs viejos llenos de `any`.
- **Sin `Agent`**, como el revisor: lo convocan, no convoca.

**Su valor está adelantado, no repartido:** pico el día cero (proponer la
severidad del compilador, que hoy cuesta cero y con cinco mil líneas escritas ya
no se hace nunca), pico en la primera rebanada (descriptor, unión discriminada y
`$type<Datos>()`), y después a demanda. **No participa de cada rebanada, y que
pasen rebanadas sin convocarlo es lo esperado.**

La costura entre ellos: el `database-specialist` define el esquema y las
migraciones, el `backend-specialist` escribe las consultas dentro de sus módulos,
y el `frontend-specialist` **nunca** toca la base — le pide al módulo. El
`typescript-specialist` no vive en ninguna de las tres áreas: vive **en las
costuras** entre ellas, que es donde un tipo duplicado a los dos lados es
invisible desde cada lado por separado.

El **contenido curado** de `contenido/` (ADR 0009) es del `backend-specialist`,
aunque viva fuera de `src/`: el único que abre esos archivos es el script de
importación, que valida cada ficha contra el **descriptor** de su tipo, y ambas
cosas son suyas. Lo que **no** es suyo es el contenido en sí, y ahí hay tres
dueños distintos, que es la razón por la que conviene escribirlo:

- **Qué** fichas entran, y **los hechos** —fechas, cifras, anécdotas, citas— son
  del **usuario**. También los derechos de imagen. Nada de eso lo decide un
  agente.
- **Cómo se redacta** la prosa —contexto, semblanza, resumen— es del
  **`narrative-specialist`**, con la skill `voz-narrativa` como regla.
- **Que una ficha inválida no entre** es del `backend-specialist`, vía el
  descriptor y la importación.

El **visto bueno explícito del usuario sobre el texto de cada ficha sigue siendo
condición de cierre**: que ahora exista un narrador no lo cambia.

#### Agentes del plugin de Vercel

El plugin trae tres agentes. **No son del organigrama**: son consultores de
plataforma, así que no se les reparte un ticket y no dejan archivos. Cada uno
tiene un **responsable** que es el único que lo convoca y el que se hace cargo
de lo que traiga.

| Agente | Lo convoca | Para qué |
| ------ | ---------- | -------- |
| `vercel:performance-optimizer` | `frontend-specialist` | Core Web Vitals, estrategia de renderizado, caché, imágenes, tipografías, tamaño del paquete |
| `vercel:ai-architect` | `super-architect` | Alternativas de plataforma cuando aparezca alcance de AI, que hoy no existe |
| `vercel:deployment-expert` | `super-architect` | Diagnosticar un despliegue, un build o una variable de entorno |

**Responsable quiere decir dueño de la conclusión, no mensajero.** Lo que el
agente devuelve es una recomendación de vendor: la traduce a una decisión del
proyecto el que lo convocó, y contra los ADR. En particular
`performance-optimizer` tensiona con la salvedad ya escrita de
`vercel-react-best-practices` —micro-optimizaciones solo con medición concreta—,
y ahí gana la salvedad.

**Pueden escribir, nunca en silencio** (ADR 0010, que supersede en este punto al
#7 y al ADR 0006). `limitar-vercel.sh` les deja leer estado de Vercel sin
preguntar, y para cualquier escritura —`deploy`, `env add/rm`, `promote`,
`rollback`, incluido `env pull`— pide confirmación explícita del usuario antes
de ejecutarse, con el comando exacto a la vista. `deployment-expert` puede
diagnosticar y ejecutar lo que propone, siempre bajo esa confirmación.

#### Previsto, todavía no existe

Un **agente de testing**, que el usuario ya anunció. Cuando llegue va al **nivel
3**, como cuarto especialista de área: sería dueño de las pruebas y de la
configuración de Vitest, que son archivos concretos, y acá el permiso de
escritura sigue a la propiedad exclusiva de un artefacto. **No va al nivel 2**,
porque el nivel 2 no es dueño de ningún archivo y eso es precisamente lo que lo
habilita a ser dueño del historial.

La puerta que aporta la consume la entrega: **el `delivery-specialist` no cierra
un ticket cuyos criterios de aceptación no estén verificados.** Los criterios de
aceptación que ya escribe hoy en cada ticket son exactamente la entrada de ese
agente, así que nada de lo que se decidió ahora hay que rehacerlo cuando exista.

Queda **una decisión pendiente** para ese momento: hoy cada especialista escribe
las pruebas de lo suyo. Si aparece un dueño de las pruebas hay que decidir si las
escribe él o si las sigue escribiendo cada uno y él las revisa. **No se decide
ahora**: todavía no hay una sola prueba.

## Principio de arquitectura

Mínimo necesario para validar el producto, diseñado para poder crecer. Cada
tecnología, patrón, abstracción o capa necesita una razón concreta y presente.
Ante la duda: la opción más simple que pueda evolucionar.

## Documentación

- `CONTEXT.md` — glosario del dominio. **Usá estos términos exactos**; no
  inventes sinónimos para conceptos que ya tienen nombre. Para el método de
  trabajo, los términos son **rebanada**, **cimiento** y **ticket**.
- `docs/marca/sistema-de-diseno.md` — la identidad **Argentum**: concepto,
  logotipo, paleta, tipografía, componentes y reglas de aplicación. Es la
  fuente del lenguaje visual y **no se edita**: donde el ADR 0008 la corrige,
  gana el ADR. Su dueño es el `brand-specialist`.
- `docs/adr/` — decisiones arquitectónicas (ADR). Leelas antes de proponer
  cambios que las contradigan.
- `docs/decisiones-pendientes.md` — lo que **todavía no** se decidió, a
  propósito, con el disparador que va a obligar a decidirlo y la regla que rige
  mientras tanto. Si vas a escribir código que roza una de esas entradas,
  **respetá la regla interina y no decidas por tu cuenta**: cuando el disparador
  se cumple, la entrada se va de ahí y nace un ADR.
- `docs/tickets-del-arranque.md` — índice y memoria del corte del arranque (los
  diez cimientos, #5 a #14). El cuerpo de cada ticket vive en su issue; este
  archivo guarda el razonamiento del corte.
- `README.md` — el proyecto explicado para una persona: alcance, stack y puesta
  en marcha. **No es fuente de decisiones**: donde diga algo distinto de un ADR
  o de `docs/decisiones-pendientes.md`, gana el ADR y el README está viejo.

## Agent skills

Configuración que las skills de ingeniería (`to-tickets` y las que vengan)
esperan encontrar. Generada con `setup-matt-pocock-skills` y **adaptada a este
repositorio**: los archivos están en español y reflejan sus restricciones reales,
no la plantilla genérica.

### Issue tracker

Los tickets son **issues de GitHub** en `luciano-stefano-meloclaps/platform-argentum`,
escritos en español, con las dependencias como texto (`Bloqueada por: #12`) y
solo con las etiquetas que existan en el repositorio (`gh label list`). Solo el
`delivery-specialist` escribe en el tracker; el resto de los subagentes solo lee.
Ver `docs/agents/issue-tracker.md`.

### Domain docs

Disposición **single-context**: un `CONTEXT.md` en la raíz y un `docs/adr/`. No es
un monorepo. Ver `docs/agents/domain.md`.

## Skills

El repositorio trae skills de terceros en `.agents/skills/`, enlazadas desde
`.claude/skills/`. Son **guías externas, no autoridad**: ninguna conoce las
decisiones de este proyecto.

**Precedencia, en este orden:**

1. Los ADR de `docs/adr/` y el vocabulario de `CONTEXT.md`.
2. El principio de arquitectura de este archivo.
3. Las skills externas.

Si una skill recomienda algo que contradice un ADR, **gana el ADR**. Si la
recomendación es mejor, se escribe un ADR nuevo que lo supersede; no se ignora
el viejo en silencio.

**Salvedades concretas:**

- `building-components` — la mitad sobre distribución (`registry`, `npm`,
  `marketplaces`, `docs`) **no aplica**: construimos un producto, no una
  biblioteca de componentes para terceros.
- `vercel-react-best-practices` — aplicar las reglas estructurales (`async-`,
  `bundle-`, `server-`) desde el principio; las micro-optimizaciones (`js-`)
  solo con una medición concreta que las justifique. Es además **la** fuente
  sobre React y Next.js: si aparece otra que se superponga —el plugin de Vercel
  trae una `react-best-practices`—, gana esta, que está versionada en
  `.agents/skills/` y fijada en `skills-lock.json` y no cambia sola.
- `improve-codebase-architecture` — **es del arquitecto**, ningún otro agente la
  usa. Necesita historial de commits y código real, así que no sirve hasta que
  haya varias rebanadas hechas. Está **modificada localmente** para que se pueda
  auto-invocar: al actualizarla desde el origen hay que volver a quitarle
  `disable-model-invocation`.
- `to-tickets` — es del `delivery-specialist`. Está **modificada localmente**
  para quitarle `disable-model-invocation` y que pueda auto-invocarla; al
  actualizarla desde el origen hay que volver a quitársela. Vale su
  **procedimiento**, no su **vocabulario**: donde dice *slice* nosotros decimos
  **rebanada** (`CONTEXT.md` manda), y no aplicamos la etiqueta
  `ready-for-agent` que sugiere, porque no existe en este repositorio.
- `setup-matt-pocock-skills` — **sigue siendo manual y la corre el usuario**, no
  un agente. A diferencia de las otras dos parcheadas, esta **conserva a
  propósito** su `disable-model-invocation`: reescribe este archivo y configura
  el tracker del repositorio remoto, y eso no lo dispara un agente por su
  cuenta. Se corre **una sola vez**, antes del primer uso de `to-tickets`.
- Sigue siendo de invocación manual, a propósito: `grill-me` (la pedís vos
  cuando querés que te interroguen).
- La accesibilidad aparece en varias skills a la vez. Ante consejos distintos,
  la referencia es `revision-de-ui`, que es nuestra: usa una copia versionada de
  las Web Interface Guidelines en lugar de bajarlas de internet en cada
  ejecución.
- `revision-dos-ejes` es la revisión de código en dos ejes (convenciones y
  especificación). Se llama así, y no `code-review`, para no pisar el comando
  integrado de Claude Code.
- `voz-narrativa` es **nuestra** y es la fuente de la voz **épica** del catálogo:
  registro, ritmo, léxico, metáfora, estructura y prohibiciones. Su dueño es el
  `narrative-specialist`, pero **cualquier agente que escriba o revise prosa del
  catálogo la cita**. Sus muestras están versionadas en
  `.claude/skills/voz-narrativa/muestras.md`, con el mismo criterio que
  `revision-de-ui`: no se baja nada de internet. Sus números —media de oración,
  techo y cadencia— están **calibrados contando esas cuatro muestras**, así que
  se cuentan, no se estiman. La ficha de Belgrano figura ahí como
  **contraejemplo**: es el registro llano que el ADR 0012 dejó atrás. Desde el
  ADR 0014 incluye también la regla de **neutralidad ante disputas políticas**
  (sección 7): se narra el hecho duro sin eufemismo, y se agrega un contrapunto
  breve para las interpretaciones en disputa de una lista acotada, sin tomar
  partido.
- `investigacion-historica` es **nuestra** y es la metodología del
  `historiador-specialist` (ADR 0014): cómo evaluar una fuente, cuántas hacen
  falta según el caso, y el criterio para reconocer cuándo un tema entra en la
  lista de disputas políticas de `voz-narrativa`. Es investigación, no
  redacción: no decide cómo se narra una disputa, solo la documenta.
- `identidad-argentum` es **nuestra** y consolida los tokens y reglas
  vigentes de la marca (v1.0 + v2, ADR 0008 + ADR 0015) en un solo lugar
  citable: paleta, tipografía, contraste ya medido y reglas de uso. Su dueño
  es el `brand-specialist`, pero **cualquier agente que escriba o revise
  interfaz la cita** — mismo patrón que `voz-narrativa` con la prosa. Es un
  **resumen citable, no una fuente**: donde no coincida con
  `docs/marca/sistema-de-diseno.md`, `sistema-de-diseno-v2.md` o los ADR
  0008/0015, ganan ellos y se corrige la skill. No reemplaza al
  `brand-specialist` para derivar un token nuevo, resolver un componente que
  ningún documento cubre, o aprobar un contraste no medido — eso lo sigue
  decidiendo él.

## Setup al clonar

1. Ejecutá `claude` en la raíz del repo y **aceptá el diálogo de confianza** del
   workspace, y la aprobación del servidor MCP `context7` que declara `.mcp.json`.
   Un repositorio clonado no puede auto-aprobar sus propios servidores MCP: la
   aprobación es manual y ocurre una sola vez.

2. *(Opcional)* Context7 funciona sin API key, con un rate limit más bajo. Para
   usar una key propia (gratuita en https://context7.com/dashboard), exportala
   en tu shell:

   ```bash
   export CONTEXT7_API_KEY=tu-key   # en ~/.zshrc o ~/.bashrc
   ```

   Alternativa equivalente, en tu `.claude/settings.local.json` (personal,
   ignorado por git):

   ```json
   { "env": { "CONTEXT7_API_KEY": "tu-key" } }
   ```

   Claude Code **no** lee un archivo `.env` para esto: la variable tiene que
   estar en el entorno del proceso o en un settings file. Nunca la pongas en
   `.claude/settings.json` ni en `.mcp.json`, que sí se commitean.

3. **El plugin `vercel@claude-plugins-official` está habilitado a propósito**, y
   el repositorio lo deja explícito en `.claude/settings.json` para que valga
   igual al clonar, sin depender de la configuración personal de cada uno. Trae
   tres agentes que sí usamos —ver "Agentes del plugin de Vercel"— y, como es
   todo o nada, también trae `/deploy` y compañía. Eso lo contiene un hook, no
   un párrafo: `limitar-vercel.sh`.

## Configuración compartida

- `.claude/agents/` — agentes del proyecto (versionados).
- `.claude/settings.json` — permisos, MCP y plugins habilitados para todo el
  equipo. Ahí vive `enabledPlugins`, que deja el plugin
  `vercel@claude-plugins-official` en `true`. Se declara acá y no en el settings
  personal de cada uno porque el ajuste del proyecto **pisa** al de usuario, y
  así el equipo ve lo mismo al clonar.
- `.mcp.json` — servidor MCP Context7, sin secretos: la key se expande
  desde la variable de entorno `CONTEXT7_API_KEY` de cada desarrollador.
- `.claude/skills/` — skills propias del proyecto (`convenciones-git`,
  `revision-de-ui`, `voz-narrativa`, `investigacion-historica`,
  `identidad-argentum`) y enlaces a las de terceros.
- `.agents/skills/` y `skills-lock.json` — skills de terceros, versionadas para
  que el repo funcione al clonarlo sin instalar nada.
- `.claude/hooks/bloquear-git-push.sh` — impide que **cualquier subagente**
  publique en el remoto, con una sola excepción: el `delivery-specialist` puede
  pushear, pero nunca contra `main`, y nunca con `--force`. Es una lista negra
  por defecto, así que un agente nuevo queda cubierto sin tocar el hook. **Solo
  pasa sin restricción la sesión principal**, que es donde está el usuario: el
  arquitecto tampoco publica. Se declara **sin el campo `if`** en
  `settings.json`, y eso es parte del bloqueo: con `if: "Bash(git *)"` el hook
  no corría sobre `rtk git push` —la forma que este mismo archivo manda usar—
  porque el comando no empieza con `git`.
- `.claude/hooks/limitar-gh.sh` — el mismo criterio para `gh`, porque publicar un
  issue es tan "hacia afuera" como un push. Acá la lista es **blanca por
  comando**, al revés que en el otro: lectura para todos, escritura de issues
  solo para el `delivery-specialist`, `pr create`/`pr merge` también solo para
  él y solo con `--base development` explícito, y todo lo demás denegado
  —`gh repo`, `gh release`, `gh label create`, `gh api` de escritura—. Un
  subcomando nuevo de `gh` **nace denegado**, que es lo correcto para algo que
  toca el remoto. El arquitecto **no** está exento: lee el tracker como
  cualquiera y no escribe en él, y no pushea ni abre PRs.
- `.claude/hooks/limitar-vercel.sh` — el tercero de la familia, y el que hace
  que el plugin de Vercel salga barato. Lista **blanca** como el de `gh`:
  lectura (`ls`, `inspect`, `logs`, `whoami`, `env ls`) para todo subagente sin
  preguntar, todo lo demás pide confirmación del usuario (`ask`, ADR 0010) en
  lugar de denegarse. Una diferencia deliberada con los otros dos: el
  subcomando **vacío también pregunta**, porque `vercel` a secas despliega el
  directorio actual y es el caso que más fácil se escapa — nunca se ejecuta sin
  que el usuario vea que eso es lo que va a pasar. Desenvuelve `rtk`, `npx`,
  `bunx` y `pnpm dlx/exec` antes de clasificar. `vercel env pull` ya no tiene
  trato especial (antes se denegaba siempre por materializar credenciales de
  producción en disco): pasa por la misma confirmación que cualquier otra
  escritura.
- `.claude/settings.local.json` — configuración personal, ignorada por git.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer)

**MODIFICADO LOCALMENTE.** `rtk init` escribe acá un catálogo de unos sesenta
comandos —cargo, go, pytest, rspec, prisma, docker, kubectl, curl, wget— de los
que este proyecto usa menos de la cuarta parte. Este archivo se carga entero en
cada sesión **y en cada subagente**, así que el catálogo completo se paga en
todos los turnos de todos los agentes a cambio de nada. Queda solo lo que el
repositorio corre de verdad. **Al volver a correr `rtk init` hay que recortarlo
otra vez**: reescribe todo lo que hay entre los dos marcadores HTML. Mismo
criterio que las skills parcheadas de la sección "Skills".

## La regla

**Poné `rtk` adelante de cualquier comando.** Si RTK tiene un filtro para ese
comando lo aplica y ahorra tokens; si no lo tiene, pasa el comando tal cual.
Nunca cambia lo que el comando hace.

En una línea compuesta, `rtk` va en **cada** tramo:

```bash
# ❌
git add src/db/esquema.ts && git commit -m "msg"

# ✅
rtk git add src/db/esquema.ts && rtk git commit -m "msg"
```

**`rtk` no es una autorización.** `rtk git push` sigue las mismas reglas que
`git push`: denegado para todo subagente salvo el `delivery-specialist` —y para
él, denegado igual si el destino es `main`—. Los tres hooks desenvuelven el
prefijo antes de clasificar el comando.

## Los comandos de este proyecto

```bash
rtk pnpm typecheck      # tsc, errores agrupados por archivo
rtk pnpm lint           # ESLint, violaciones agrupadas
rtk pnpm test           # Vitest, solo lo que falla
rtk pnpm build          # next build con métricas por ruta
rtk pnpm install

rtk git status | log | diff | show | add | commit | branch
rtk gh issue list | issue view <n>

rtk ls <ruta> | read <archivo> | grep <patrón> | find <patrón>
rtk docker ps           # el contenedor de PostgreSQL local
rtk err <cmd>           # filtra solo los errores de cualquier comando
rtk proxy <cmd>         # corre sin filtrar, para depurar el filtro mismo
```
<!-- /rtk-instructions -->