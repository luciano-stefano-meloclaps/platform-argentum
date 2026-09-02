# 0008 — Identidad visual Argentum

- **Estado:** Propuesto
- **Fecha:** 2026-09-02
- **Decide:** el usuario

## Decisión

Adoptamos la identidad visual **Argentum**, versionada en
[`docs/marca/sistema-de-diseno.md`](../marca/sistema-de-diseno.md), como fuente
única del lenguaje visual del producto: concepto, logotipo, paleta, tipografía,
espaciado, texturas y reglas de aplicación. Este ADR la adopta **con cuatro
correcciones vinculantes** —contraste, peso tipográfico, íconos y carga de
fuentes— y con el **cambio de vocabulario de las ligas** que la identidad trae.

## Contexto

El proyecto es greenfield: no hay una línea de código ni una hoja de estilos. El
ADR 0003 fijó el stack —Tailwind v4, sin librería de componentes, sin librería
de íconos— y dejó abierto qué aspecto tiene el producto. El
`visual-design-specialist` existía justamente para proponer paleta y tipografía
desde cero y esperar aprobación.

El usuario condujo por fuera del repositorio un proceso de definición de
identidad y volvió con un documento de handoff cerrado: **Argentum**, un sistema
completo de marca con paleta derivada de un celeste elegido por el cliente,
dos familias tipográficas, escala, radios, sombras, componentes clave y reglas
de uso.

Eso cambia la naturaleza del trabajo de diseño en el proyecto. Ya no hay que
**inventar** el lenguaje visual: hay que **custodiarlo, corregirlo donde no
cumple y aplicarlo con criterio**.

## Problema

Tres problemas concretos, y ninguno se resuelve solo.

**1. La identidad no está en el repositorio.** Un documento que vive en el chat
no es una fuente: no se puede citar en un ticket, no tiene historial y el
próximo agente que abra el proyecto no lo ve. Mientras tanto, cada pantalla
empieza a inventar su propio celeste.

**2. La identidad contradice cosas ya decididas.** Pide una librería de íconos
que el ADR 0003 deliberadamente no tiene, renombra las ligas que `CONTEXT.md`
ya bautizó, y carga las fuentes por una vía que Next.js desaconseja. Sin
resolverlo por escrito, cada agente resuelve distinto.

**3. Ocho pares de color de la identidad no pasan WCAG AA.** Verificado
midiendo, no leyendo. Este producto lo usan chicos y se va a usar en pantallas
baratas, con brillo bajo y a veces al sol; el propio documento de marca dice que
el contraste importa, pero varios de sus pares no llegan. Dos de ellos están en
los componentes más usados que existen: el **botón primario** y la **franja de
la tarjeta de contenido**.

Medición sobre los pares que la identidad declara explícitamente:

| Par declarado por la marca | Real | WCAG AA texto normal |
| --- | ---: | --- |
| `--texto-sobre-celeste` #FFFFFF sobre `--celeste-400` #5DADE2 | **2.46:1** | falla, y falla también AA-large |
| `--dorado-text` #C98A00 sobre `--dorado-bg` #FFF8E8 | **2.79:1** | falla |
| `--dorado-text` #C98A00 sobre `--crema` #FBF7F0 | **2.76:1** | falla |
| `#FFFFFF` sobre `--celeste-600` #1E96F5 (botón primario, 14px) | **3.12:1** | falla |
| `--alerta` #B26A00 sobre `--alerta-bg` #FBF0DA | **3.75:1** | falla |
| `--texto-terciario` #8A7B66 sobre `--crema` #FBF7F0 (12px) | **3.85:1** | falla |
| `--error` #C94A4A sobre `--error-bg` #FBE9E9 | **3.93:1** | falla |
| `--ok` #2E7D5B sobre `--ok-bg` #E9F5EF | **4.47:1** | al borde, falla |

El resto de la paleta pasa con holgura: las seis categorías van de 4.63:1 a
6.38:1, las cuatro ligas de 4.82:1 a 5.75:1, y los textos principales sobre
crema de 5.98:1 a 10.98:1. **El problema es acotado y tiene arreglo barato**, no
es un sistema mal construido.

Un dato menor y verificado: el documento afirma que el dorso de la tarjeta de
repaso (`#F2D488` sobre `#0A3D66`) da 8.2:1. Da **7.77:1**. Sigue pasando AAA,
así que la excepción se sostiene; solo el número estaba mal.

## Alternativas consideradas

### A. Adoptar la identidad tal cual, sin tocar nada

Se versiona el documento y se aplica al pie de la letra, incluidos los pares que
no pasan contraste.

### B. Adoptar con correcciones vinculantes en este ADR

Se versiona el documento **sin editarlo** —es la entrega del cliente, y editarla
borra el original— y este ADR fija por escrito las correcciones. Un dueño único
de la marca en el equipo las sostiene.

### C. Devolver la identidad al proceso de diseño para que la corrijan afuera

No se adopta nada hasta que el documento vuelva corregido.

### D. No hacer nada / posponer

Se sigue sin lenguaje visual hasta que haya pantallas que lo pidan.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| --- | --- | --- | --- |
| A | Cero fricción, respeta literalmente lo que el cliente aprobó | Publica un producto para chicos con el botón primario y la franja de tarjeta ilegibles; el arreglo después cuesta tocar todas las pantallas | Alto: el color ya está en todos lados |
| B | La identidad entra hoy y entra bien; el original se conserva intacto; el arreglo cuesta seis valores antes de que exista la primera pantalla | Introduce una diferencia entre el documento de marca y lo que corre, que hay que explicar (lo hace este ADR) | Bajo: son seis tokens y todavía no hay código |
| C | El documento queda coherente consigo mismo | Bloquea todo el frontend por un ida y vuelta que resuelve seis valores; y el criterio de accesibilidad lo tenemos nosotros, no el proceso de afuera | Medio |
| D | No se decide nada prematuro | Es exactamente lo contrario a lo que pasa: la identidad ya existe y está aprobada. Posponer solo garantiza que las primeras pantallas inventen colores | Alto |

## Decisión elegida

**Alternativa B.**

### 1. La identidad se versiona y es vinculante

`docs/marca/sistema-de-diseno.md` es la **fuente de la marca**. Se conserva tal
como se recibió. Si la identidad cambia, se escribe un ADR nuevo y una **v2**
del documento; no se edita la v1.

### 2. Correcciones de contraste

El piso es **WCAG AA (4.5:1) para todo texto**, no AA-large. Los ocho pares de
arriba se resuelven con **seis valores** —`--dorado-text` arregla dos a la vez, y
el octavo no se arregla con un valor sino con una regla de uso—:

| Token | Marca | Vigente | Sobre | Queda en |
| --- | --- | --- | --- | ---: |
| `--celeste-700` *(nuevo)* | — | `#0978D0` | blanco | 4.56:1 |
| `--dorado-text` | `#C98A00` | `#9A6900` | `--dorado-bg` | 4.52:1 |
| `--texto-terciario` | `#8A7B66` | `#7E705D` | `--crema` | 4.51:1 |
| `--ok` | `#2E7D5B` | `#2E7C5A` | `--ok-bg` | 4.53:1 |
| `--error` | `#C94A4A` | `#C23A3A` | `--error-bg` | 4.53:1 |
| `--alerta` | `#B26A00` | `#9F5F00` | `--alerta-bg` | 4.52:1 |

Y dos reglas de uso, porque no todo se arregla cambiando un valor:

- **`--celeste-400` es superficie, no fondo de texto.** Blanco sobre él da
  2.46:1 y no hay corrección posible que conserve el color de marca. La franja
  de la tarjeta de contenido es decorativa. Si alguna vez lleva texto, va en
  `--texto-titulo` (4.77:1) o `--celeste-900` (4.56:1) — **nunca blanco**.
- **El botón primario usa `--celeste-700`**, no `--celeste-600`. `--celeste-600`
  queda para superficies y bordes sin texto encima.

`--texto-sobre-celeste` deja de ser un token válido sobre `--celeste-400`: solo
aplica sobre `--celeste-700` y `--celeste-900`.

Los valores nuevos se obtuvieron bajando la luminosidad en HLS conservando tono
y saturación, así que son el mismo color un paso más oscuro: la identidad no
cambia de aspecto.

### 3. Peso tipográfico de los títulos: 700, no 900

Cormorant Garamond no tiene peso 900, y el `@import` del propio documento carga
600 y 700. Pedir 900 produce **negrita sintética**: el navegador engorda el
trazo por su cuenta y arruina exactamente el contraste fino/grueso que es la
razón por la que se eligió esta tipografía. `--type-display`, `--type-h1` y
`--type-h2` van en **700**.

### 4. Íconos: se copian, no se instalan

**No se agrega `@tabler/icons-react` ni ninguna otra dependencia de íconos.** El
ADR 0003 decidió no tener librería de íconos y esa decisión sigue en pie.
Tabler Icons queda como **librería de referencia**: los siete íconos de
categoría que la marca asigna se copian al repositorio como SVG inline, con su
atribución. Tabler es MIT y lo permite.

El motivo es el principio de arquitectura: son siete archivos SVG contra una
dependencia con versión, superficie de API, peso de bundle y actualizaciones. Si
algún día hacen falta cuarenta íconos, se reconsidera — y esa es la señal
escrita más abajo.

### 5. Fuentes: `next/font/google`, no `@import`

Las dos familias se cargan con `next/font/google`, que las auto-hospeda, elimina
el salto de layout y no hace una petición a un tercero desde el navegador del
chico. El `@import` del documento de marca queda como declaración de qué
familias y pesos usa la identidad, no como instrucción de implementación.

### 6. Las ligas pasan a llamarse Cobre, Plata, Oro y Litio

`CONTEXT.md` y el README decían *"de 0 a 1000, bronce, y así"* — un
marcador de posición, nunca un nombre elegido. La identidad propone los cuatro
metales del suelo argentino en orden ascendente, que además cierra con el
concepto de marca: *Argentum* es la plata.

**Se adopta**, con los umbrales del documento:

| Liga | Puntos |
| --- | --- |
| Cobre | 0–500 |
| Plata | 501–1500 |
| Oro | 1501–3000 |
| Litio | 3001+ |

Sigue valiendo lo que dice `CONTEXT.md`: la liga **no se sube ni se baja**, no
se compite con nadie y es una función pura del total de puntos. Los umbrales son
un número de producto y son baratos de mover: no se guarda liga en ninguna
parte, se calcula al leer.

`CONTEXT.md` y `README.md` se actualizan en consecuencia.

### 7. Dueño de la marca en el equipo

Se crea el agente **`brand-specialist`** (`.claude/agents/brand-specialist.md`),
dueño único de la identidad y de los tokens `@theme`, y **se elimina el
`visual-design-specialist`**, cuyo territorio era el mismo.

El motivo es el mismo por el que el `delivery-specialist` es dueño del
historial: **un artefacto con dos dueños no tiene dueño**. El trabajo para el
que existía el `visual-design-specialist` —proponer paleta y tipografía y
esperar aprobación— está hecho y aprobado. Lo que queda es custodiar una marca
que ya existe, que es un trabajo distinto y de una sola persona.

Lo que ese agente tenía y sigue haciendo falta —el piso de legibilidad para
chicos, la sintaxis de Tailwind v4, el criterio de cuándo un token se
justifica— se absorbe en el agente nuevo.

### 8. El piso de legibilidad convive con "no infantil"

La marca declara un territorio **transversal, no infantil**, y tiene razón: el
producto no tiene que parecer una app de jardín de infantes. Pero *no infantil*
es una decisión de **estilo**, y la legibilidad es un requisito de **producto**:
lo usan chicos de ocho años en pantallas malas.

Los dos conviven sin tocar la identidad, usando sus propios tokens:

- **En superficies de lectura** —ficha, tarjeta de repaso, enunciado del quiz—
  el cuerpo es `--type-body-lg` (16px).
- `--type-body` (14px) y abajo quedan para **interfaz**: labels, metadatos,
  navegación, chips.
- Los objetivos táctiles tienen un mínimo definido en la escala de espaciado, no
  a criterio de cada pantalla.
- El color nunca es el único portador de significado. En el quiz, acertar y
  errar se distinguen además por forma, ícono o texto.

## Motivo

Adoptamos en lugar de devolver porque **el criterio de accesibilidad lo tenemos
nosotros**: quien definió la identidad resolvió bien la marca, y el contraste
de un par de tokens es un detalle de implementación que se arregla acá en seis
valores, no un ida y vuelta que frena el frontend.

Corregimos en el ADR en lugar de editar el documento porque el documento es
**la entrega del cliente**, y este repositorio ya decidió cómo trata las
decisiones que cambian: se supersede por escrito, no se edita el original en
silencio (ver `docs/adr/README.md`). Quien lea la marca dentro de un año va a
ver qué se entregó y qué se cambió, con el número medido al lado.

Sostenemos el ADR 0003 en lo de los íconos porque nada cambió en el argumento:
siete SVG no justifican una dependencia. La identidad pide *estos íconos*, no
*esta librería*.

## Consecuencias

**Aceptamos:**

- Una **diferencia permanente** entre el documento de marca y lo que corre, en
  seis valores de color, tres pesos tipográficos y dos reglas de uso. Cuesta
  explicarla cada vez que alguien compara — este ADR es esa explicación, y el
  documento la señala con ⚠️ en cada punto.
- Que los íconos sean **trabajo manual**: agregar una categoría nueva implica
  copiar un SVG, no importar un nombre.
- Que el celeste de marca `--celeste-400` **no pueda llevar texto encima**. Es
  el color protagonista y hay una tentación permanente de escribirle arriba.

**Obtenemos:**

- Un lenguaje visual **completo y aprobado** antes de la primera pantalla, que
  es exactamente cuando vale.
- Una paleta que **pasa WCAG AA entera**, medida y no supuesta.
- Un **dueño único** de la marca, con la fuente versionada en el repositorio.
- Coherencia conceptual real: la tipografía de interfaz es argentina, las ligas
  son los metales del suelo argentino y el nombre es la plata.

**Deuda técnica asumida:**

- **No hay modo oscuro** y no se decide ahora. La identidad está construida
  sobre un fondo crema cálido que no tiene traducción obvia a oscuro; hacerlo
  duplica cada decisión de contraste. Cuando se pida, es un ADR nuevo.
- **Las texturas de marca** (baldosa calcárea, filete) están descriptas pero no
  producidas. Son activos que hay que dibujar.
- El **isotipo "Ag"** está descripto y no existe como archivo.

**Revisar si:**

- Hacen falta **más de veinte íconos**: ahí la dependencia empieza a ganarle al
  trabajo manual, y se escribe un ADR que supersede el punto 4.
- Aparece un pedido de **modo oscuro** o de **alto contraste**.
- La identidad se revisa y aparece una **v2** del documento de marca.
- Los umbrales de liga resultan mal calibrados con uso real: se mueven sin ADR,
  son un número de producto.
