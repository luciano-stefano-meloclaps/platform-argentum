# 0004 — Contenido curado en archivos versionados, importado a la base

- **Estado:** Aceptado
- **Fecha:** 2026-08-30
- **Decide:** Luciano Melo Claps

## Decisión

El **contenido curado** del catálogo se redacta en **archivos versionados en el
repositorio**. Un script de importación lo carga en PostgreSQL, que es lo que
sirve la aplicación.

Las propuestas de usuarios (fase posterior) escriben directamente en PostgreSQL.

## Contexto

El MVP contempla alrededor de 60 fichas, cargadas por el dueño del producto:
_"lo cargo yo, desde cero"_. No hay contenido preexistente ni fuente externa de
la que importar.

Se identificó desde el análisis funcional que **el contenido es el riesgo número
uno del proyecto**, y que no es un riesgo técnico: es volumen de redacción,
exactitud histórica —material educativo para chicos— y derechos de uso de las
imágenes.

Durante el MVP el contenido es prácticamente estático: se escribe una vez, se
corrige de tanto en tanto, y nadie más que el dueño lo edita. Las propuestas de
modificación por parte de usuarios llegan en una fase posterior.

## Problema

Dónde vive la verdad del contenido.

Un archivo versionado da historial, revisión antes de publicar y posibilidad de
revertir —tres cosas que importan mucho cuando el contenido es educativo y un
error factual es un problema real—. Una base de datos da consultas eficientes y
escritura concurrente, que es lo que van a necesitar las propuestas de usuarios.

La pregunta se había planteado como una disyuntiva: **¿hace falta base de datos
para el MVP, o alcanzan los archivos?**

## Alternativas consideradas

### A. Solo archivos
Sitio estático generado desde archivos, sin base de datos en el MVP.

### B. Solo base de datos
El contenido se carga a mano en PostgreSQL desde el principio. Los archivos no
existen.

### C. Archivos como fuente, importados a la base
Los archivos son la fuente de autoría; la base es lo que sirve la aplicación.

### D. CMS externo
Un gestor de contenidos de terceros como fuente de verdad.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Solo archivos | Historial, revisión y revert gratis; nada de infraestructura en el MVP | Las propuestas de usuarios necesitan escritura concurrente: al llegar la fase 2 hay que introducir la base igual, con contenido ya cargado | Medio |
| B. Solo base | Un único lugar; listo para propuestas desde el día uno | Se pierde historial, revisión y revert justo donde más importan: el contenido educativo. Corregir un error factual no deja rastro | Medio |
| C. Archivos + import | Historial y revisión para el contenido curado; base para servir y para recibir propuestas | Dos representaciones del mismo contenido; hay que ejecutar la importación | Bajo |
| D. CMS externo | Interfaz de edición ya hecha | Dependencia externa y costo recurrente para 60 fichas que carga una sola persona; contradice el principio de mínimo necesario | Medio |

## Decisión elegida

**Alternativa C.** Los archivos versionados son la fuente de autoría del
contenido curado. PostgreSQL es lo que la aplicación consulta.

La validación en la importación usa el mismo descriptor por tipo definido en el
ADR 0001: si una ficha no cumple el esquema, la importación falla y el contenido
no entra.

## Motivo

La disyuntiva era falsa. **Separar autoría de servicio** disuelve el conflicto:
son dos etapas de la misma tubería, no dos opciones excluyentes.

El contenido curado se escribe despacio, necesita revisión y a veces hay que
volver atrás: eso es exactamente para lo que sirve el control de versiones, y
sale gratis porque el repositorio ya existe. Lo que la aplicación sirve, y lo que
recibe las propuestas de usuarios, necesita una base de datos.

Hay además un motivo de planificación que pesó tanto como el técnico: como los
archivos no dependen del código, **la redacción del contenido puede avanzar en
paralelo al desarrollo**, sin esperar a que haya una pantalla de carga. Dado que
el contenido es el riesgo número uno y la parte más lenta del proyecto,
desbloquearlo desde el primer día tiene más valor que cualquier optimización
técnica de esta decisión.

La alternativa A era defendible mientras el catálogo fuera de solo lectura, pero
posterga un problema conocido: las propuestas de usuarios ya están en el plan del
producto, y llegan con escritura concurrente y moderación. Introducir la base
después, con el contenido ya cargado, es más caro que hacerlo ahora.

## Consecuencias

**Aceptamos:**
- Existen dos representaciones del mismo contenido: los archivos y las filas.
- Hay un paso de importación que ejecutar; si se olvida, lo publicado queda
  desactualizado respecto de los archivos.
- El contenido curado **no** se edita desde la web: se edita en el repositorio.

**Obtenemos:**
- Historial, revisión y reversión del contenido educativo, sin construir nada.
- La redacción del contenido —el riesgo principal— avanza en paralelo al
  desarrollo y no depende de él.
- Validación del contenido contra el descriptor del tipo antes de publicarlo.
- Una base de datos ya presente el día que lleguen las propuestas, sin migración
  de contenido.

**Deuda técnica asumida:**
- Cuando las propuestas aprobadas empiecen a escribir en la base, la base y los
  archivos van a divergir. Hay que decidir entonces una de dos: exportar de
  vuelta a archivos, o degradar los archivos a semilla inicial y aceptar que la
  base pasa a ser la fuente de verdad. **La decisión se pospone a propósito**
  hasta que la moderación exista; anticiparla sería diseñar sin información.

**Revisar si:**
- El volumen o la frecuencia de edición vuelven incómodo el flujo por
  repositorio.
- Entra a cargar contenido gente sin perfil técnico, que no va a editar archivos
  ni usar control de versiones.
- La moderación entra en producción: ahí hay que resolver la divergencia
  anotada como deuda.
