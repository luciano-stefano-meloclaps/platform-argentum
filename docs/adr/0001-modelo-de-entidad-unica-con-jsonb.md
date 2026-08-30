# 0001 — Modelo de entidad única con JSONB y descriptores en código

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

El catálogo se modela con **una sola tabla `entidad`**, con un discriminador
`tipo` y una columna `datos` de tipo JSONB. Los atributos propios de cada tipo
se definen en **descriptores escritos en código**, no en la base de datos ni en
tablas de metadatos.

## Contexto

Proyecto greenfield. El producto es un catálogo sobre Argentina para que chicos
aprendan. Los tipos de entidad conocidos hoy son próceres, monumentos
arquitectónicos, monumentos naturales, eventos históricos, fechas patrias,
comida y animales.

La frase que más condicionó este diseño la dijo el dueño del producto al
describir los tipos: _"entre otras que actualmente no se me ocurren"_. Es decir:
**el conjunto de tipos no está cerrado y se sabe de antemano que no lo está.**

Restricciones reales: un solo desarrollador, producto sin validar, y un MVP de
alrededor de 60 fichas. El contenido se carga de forma curada, no la generan los
usuarios (las propuestas de usuarios son una fase posterior).

## Problema

Cada tipo de entidad tiene atributos distintos —un prócer tiene fechas de
nacimiento y muerte, un monumento tiene ubicación, un animal tiene hábitat— y
van a aparecer tipos nuevos que hoy no están enumerados.

Si agregar un tipo cuesta una migración, tablas nuevas, consultas nuevas y
pantallas nuevas, el catálogo va a dejar de crecer por fricción técnica y no por
decisión de producto. Ese es el problema concreto a resolver.

## Alternativas consideradas

### A. Una tabla por tipo (modelo relacional clásico)
`procer`, `monumento`, `animal`… cada una con sus columnas nativas. Es el modelo
más ortodoxo y el que mejor aprovecha la base de datos.

### B. Entidad única con JSONB y descriptores en código
Una tabla `entidad(id, tipo, slug, nombre, datos jsonb, …)`. La forma de `datos`
para cada tipo vive en un descriptor en el código de la aplicación.

### C. EAV o tipos de contenido definidos en la base
Tablas de metadatos (`tipo`, `atributo`, `valor`) que permiten definir tipos
nuevos sin tocar código. Es, en esencia, construir un CMS.

### D. Posponer: arrancar con una tabla por tipo y refactorizar
Empezar por A y migrar a B si el dolor aparece.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Tabla por tipo | Integridad referencial y tipos nativos; consultas y filtros óptimos; es lo que la base sabe hacer mejor | Cada tipo nuevo = migración + tablas + consultas + pantallas; el código de listado y ficha se multiplica por tipo | Alto: migrar N tablas a un modelo único es reescribir el acceso a datos |
| B. Entidad única + JSONB | Un tipo nuevo es un descriptor; una sola tabla, un solo camino de lectura; el descriptor es fuente única para tipar, importar, validar y renderizar | La base no valida la forma de `datos`; sin integridad referencial dentro del JSON; filtrar por atributos internos es más incómodo | Medio: promover atributos a columnas es incremental, atributo por atributo |
| C. EAV / tipos en base | Máxima flexibilidad; se agregan tipos sin desplegar | Complejidad alta y permanente; consultas ilegibles; se pierde el tipado; es construir un CMS que nadie pidió | Alto |
| D. Posponer | Evita comprometerse temprano | El costo de la migración cae justo cuando ya hay contenido cargado y pantallas hechas | — |

## Decisión elegida

**Alternativa B**, con un límite explícito: los descriptores viven en el
código, **no** en la base. No se construye un sistema de tipos definibles por el
usuario.

Alcance: aplica al catálogo (módulo `catalogo`). No aplica a los datos de
progreso de aprendizaje, que tienen forma fija y conocida (ver ADR 0002).

## Motivo

El principio de arquitectura del proyecto pide el mínimo necesario para validar
el producto, diseñado para poder crecer. Acá el eje de crecimiento está
identificado con precisión: **este producto escala por catálogo, no por carga.**
El diseño tiene que abaratar exactamente eso.

La alternativa A optimiza consultas que con 60 registros no son un problema, y
encarece agregar tipos, que sí es el problema real. Es optimizar la dimensión
equivocada.

La alternativa C resuelve un requisito que nadie tiene: nadie va a definir tipos
de contenido nuevos desde una pantalla. Los tipos los define el dueño del
producto, que también controla el código. Poner esa capacidad en la base es
pagar la complejidad de un CMS por una necesidad inexistente.

La razón decisiva a favor de B es que **el descriptor de un tipo se usa en cinco
lugares distintos**: tipa la columna JSONB, valida la importación de contenido,
valida las propuestas de usuarios, renderiza el formulario y renderiza la ficha.
Escrito una sola vez, esos cinco usos no pueden desincronizarse. Este argumento
pesó también en la elección del stack (ver ADR 0003).

Sobre el tipado: si se adopta Drizzle, `jsonb().$type<Datos>()` da tipado en
tiempo de compilación sobre la columna —verificado en su documentación
(drizzle-kit 0.31.5)—. La elección del ORM **no** forma parte de esta decisión y
queda diferida: es reversible en una tarde y no condiciona el modelo.

## Consecuencias

**Aceptamos:**
- La base de datos no valida la forma de `datos`. La validación es
  responsabilidad de la aplicación, en el borde del módulo `catalogo`.
- No hay integridad referencial sobre campos que viven dentro del JSON.
- Filtrar o buscar por un atributo interno es menos directo que sobre una
  columna nativa.

**Obtenemos:**
- Agregar un tipo de entidad es escribir un descriptor y cargar contenido. Sin
  migración, sin tablas, sin pantallas nuevas.
- Un solo camino de lectura y un solo conjunto de pantallas para todo el
  catálogo.
- Una fuente de verdad única por tipo, compartida por los cinco usos.

**Deuda técnica asumida:**
- Si un atributo se vuelve central para búsqueda o filtrado intensivo, habrá que
  promoverlo a columna real. El costo es acotado: una migración por atributo,
  sin rediseñar el modelo.

**Revisar si:**
- Un tipo desarrolla relaciones propias complejas (no solo atributos planos).
- El volumen o los filtros hacen que las consultas sobre JSONB dejen de rendir.
- Aparece el requisito de que usuarios finales definan tipos de contenido: ahí
  sí haría falta metadata en la base, y esta decisión quedaría superada.
