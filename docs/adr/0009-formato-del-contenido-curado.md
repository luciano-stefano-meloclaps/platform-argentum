# 0009 — Formato, ubicación e imágenes del contenido curado

- **Estado:** Propuesto
- **Fecha:** 2026-09-04
- **Decide:** Luciano Melo Claps

## Decisión

El **contenido curado** se escribe como **un archivo TypeScript por entidad**,
tipado por el **descriptor** de su tipo. Los archivos viven en `contenido/`, en
la raíz del repositorio y fuera de `src/`, con la forma
`contenido/<tipo>/<slug>.ts`: el directorio es el **tipo** y el nombre del
archivo es el **slug**. La imagen de cada ficha se guarda en
`public/contenido/<tipo>/<slug>.webp` y el archivo de contenido **no** declara
su ruta: declara únicamente el texto alternativo, el crédito y la licencia.

## Contexto

El ADR 0004 decidió que el contenido curado vive en archivos versionados y que
un paso de **importación** lo carga en PostgreSQL. No decidió en qué formato, ni
dónde, ni qué hacer con las imágenes: dejó los tres puntos abiertos.

El proyecto está por arrancar su primera **rebanada** de producto —la ficha de
un prócer, de archivo a pantalla— y esos tres puntos los tocan a la vez el
descriptor, la importación y la pantalla. No se puede empezar sin resolverlos.

El estado real: el catálogo del MVP son unas 60 fichas; las escribe una sola
persona, que es el dueño del producto y edita el repositorio directamente. El
ADR 0004 ya nombró el contenido como el riesgo número uno del proyecto, con tres
caras: volumen de redacción, exactitud histórica y **derechos de uso de las
imágenes**. El repositorio ya corre TypeScript sin paso de compilación previo en
sus scripts: `src/db/ping.mts` se ejecuta con `node` a secas.

## Problema

Cómo se escribe una ficha, dónde se guarda y de dónde sale su imagen.

Detrás de la pregunta de formato hay una pregunta más concreta: **cuándo se
entera el redactor de que la ficha está mal**. Puede enterarse mientras escribe,
al correr la importación, o nunca —si el error es de contenido y no de forma—.
Cuanto más tarde, más caro, y acá el redactor y el desarrollador son la misma
persona trabajando en el mismo editor.

Y una tercera, que no es de comodidad sino de riesgo: **cómo se garantiza que
ninguna imagen se publique sin sus derechos declarados**.

## Alternativas consideradas

### A. JSON por entidad
`contenido/<tipo>/<slug>.json`, validado por el descriptor en la importación.

### B. Markdown con front-matter YAML
La prosa como cuerpo Markdown, los campos estructurados en el front-matter.

### C. TypeScript por entidad, tipado por el descriptor
`contenido/<tipo>/<slug>.ts`, con un `export default` que el compilador verifica
contra el tipo que sale del descriptor.

### D. Posponer y decidirlo dentro de la rebanada 1
No escribir ADR: que lo resuelva quien implemente la importación.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. JSON | Cero dependencias; formato neutro; el día que edite alguien no técnico, es lo más cerca de un CMS | El error aparece recién al correr la importación; la prosa larga en JSON es hostil —sin saltos de línea, todo escapado—; no hay autocompletado de campos | Bajo |
| B. Markdown + front-matter | Lo mejor para prosa larga; el formato natural del contenido editorial; portable a cualquier CMS futuro | Introduce dos dependencias (parser de YAML y de front-matter) y **dos** gramáticas por archivo; el error aparece en la importación; el front-matter no se valida hasta ejecutarlo | Bajo |
| C. TypeScript | El error aparece **en el editor**, antes de correr nada; autocompletado de los campos del descriptor; cero dependencias nuevas; la importación es un `import`, no un parser | El contenido queda escrito en un lenguaje de programación, lo que lo vuelve inaccesible para un redactor no técnico; la prosa larga necesita template literals | Bajo |
| D. Posponer | No gasta tiempo ahora | La decisión igual se toma, pero la toma implícitamente quien escriba la importación primero, sin quedar registrada. Es el caso que este proyecto declaró querer evitar | — |

## Decisión elegida

**Alternativa C**, con tres definiciones concretas que la cierran.

**1. Formato.** Un archivo TypeScript por entidad. Exporta por defecto un objeto
con el **nombre** de la entidad y sus **datos**, y el compilador lo verifica
contra el tipo que el descriptor de ese tipo infiere. La prosa larga va en
template literals.

Los archivos de contenido se limitan a **TypeScript de tipos borrables**: nada
de `enum`, `namespace` ni decoradores. Eso es lo que permite que el script de
importación los ejecute con `node` directamente, como ya hace `src/db/ping.mts`,
sin agregar un compilador al camino.

**2. Ubicación.** `contenido/<tipo>/<slug>.ts`, en la raíz y **fuera de `src/`**.
El directorio es el tipo y el nombre del archivo es el slug: ninguno de los dos
se repite dentro del archivo, así que no pueden desincronizarse. La importación
descubre las fichas recorriendo el directorio; **no hay un índice manual** que
alguien se olvide de actualizar al agregar una ficha.

Fuera de `src/` a propósito: el contenido **no** es código de la aplicación y
nunca se importa desde ella. La capa web le pide al módulo `catalogo`, que lee
de la base (ADR 0002). El único que abre estos archivos es el script de
importación. Tenerlos afuera hace visible esa regla en el árbol de directorios.

**3. Imágenes.** Una imagen por ficha, versionada en
`public/contenido/<tipo>/<slug>.webp`. La ruta **se deriva** del tipo y del
slug, con la extensión fijada: el archivo de contenido no la escribe. Lo que sí
declara, y son campos **obligatorios** del descriptor:

- el **texto alternativo**, porque una ficha sin alt es una ficha inaccesible;
- el **crédito** y la **licencia**, con la fuente de donde salió la imagen.

La importación **falla** si el archivo de imagen no existe en la ruta derivada.
Eso es lo que vuelve segura a la convención en lugar de frágil.

Esta decisión aplica solo al **contenido curado**. Las **propuestas** de
usuarios escriben directamente en la base y no pasan por acá (ADR 0004).

## Motivo

La razón decisiva es **cuándo aparece el error**. Con A y con B, escribir mal
una ficha se descubre al correr la importación; con C se descubre subrayado en
el editor, en el momento de escribirla. Como el descriptor ya existe y ya es la
fuente única de la forma de un tipo (ADR 0001), obtener esa verificación no
cuesta nada: es el mismo esquema Zod del que sale el tipo, usado un lugar más.
El descriptor pasa así a servir en seis lugares en vez de cinco, y el argumento
del ADR 0001 se refuerza en lugar de diluirse.

El segundo motivo es el **costo permanente**. B es el formato mejor para prosa,
y en un proyecto con redacción tercerizada probablemente ganaría. Acá agrega dos
dependencias y una segunda gramática por archivo a cambio de comodidad para una
sola persona que ya escribe TypeScript todos los días. La regla de la puerta no
lo justifica hoy.

La objeción real contra C —el contenido queda en un lenguaje de programación— es
cierta, pero el ADR 0004 ya la anotó como un cambio de contexto futuro y no
presente: hoy edita el dueño del producto, desde el repositorio.

Sobre las imágenes: derivar la ruta en vez de escribirla elimina un campo que
puede apuntar a un archivo que no existe. Y obligar a declarar licencia y
crédito convierte el riesgo de derechos que nombró el ADR 0004 en algo que el
compilador y la importación hacen cumplir, en lugar de una buena intención. Una
imagen sin licencia declarada no compila; una licencia declarada mal es un
problema humano, pero al menos deja rastro en el historial.

## Consecuencias

**Aceptamos:**
- El contenido queda escrito en TypeScript, y por lo tanto **no lo puede editar
  alguien sin perfil técnico**.
- Los archivos de contenido están sujetos al linter y al compilador del
  proyecto: un error de contenido puede romper `pnpm typecheck`. Es el efecto
  buscado, pero significa que la redacción y el código comparten la misma señal
  de rojo.
- La restricción de "tipos borrables" es una regla que hay que recordar y que
  nada más que la ejecución hace cumplir.
- Una sola imagen por ficha, y en un solo formato. Una ficha que necesite dos
  imágenes obliga a revisar esta decisión.

**Obtenemos:**
- El error de contenido aparece en el editor, con autocompletado de los campos
  del tipo, antes de correr nada.
- Cero dependencias nuevas: ni parser de YAML, ni de front-matter, ni de MDX.
- La importación es un `import` y un recorrido de directorio, no un parser.
- Tipo y slug tienen un solo lugar donde vivir —la ruta del archivo— y no pueden
  contradecirse.
- Ninguna imagen entra al catálogo sin texto alternativo, crédito y licencia.
- Agregar una ficha es agregar un archivo. No hay índice que actualizar.

**Deuda técnica asumida:**
- El contenido y el código comparten repositorio, compilador y linter. Si algún
  día se separan, hay que sacar `contenido/` del `include` del compilador y
  darle su propia verificación.
- Fijar `.webp` es una simplificación: cuando aparezca una imagen que convenga
  servir en otro formato, hay que elegir entre convertirla o volver a la ruta
  explícita. Convertirla es lo primero a evaluar.

**Revisar si:**
- **Entra a redactar alguien sin perfil técnico.** Ahí se migra a Markdown con
  front-matter, y es barato precisamente porque el descriptor no cambia: sigue
  siendo la misma fuente de la forma del tipo, validando el mismo objeto; lo
  único que se reemplaza es cómo se lee el archivo, que es una función dentro de
  la importación. El disparador ya estaba anotado en el ADR 0004.
- El volumen de fichas vuelve incómodo escribir prosa larga en template
  literals.
- Aparece una ficha que necesita más de una imagen, o una que no puede ser
  `.webp`.
- La **moderación** entra en producción: ahí hay que resolver la divergencia
  entre archivos y base que el ADR 0004 dejó anotada como deuda.
