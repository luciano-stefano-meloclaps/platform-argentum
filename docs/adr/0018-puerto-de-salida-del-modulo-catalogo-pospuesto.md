# 0018 — El puerto de salida del módulo `catalogo` queda pospuesto

- **Estado:** Aceptado
- **Fecha:** 2026-09-19
- **Decide:** el `super-architect`, con el criterio técnico del
  `backend-specialist` y el `database-specialist` (ticket #60)

## Decisión

`catalogo` **no** declara hoy una interfaz de persistencia que Drizzle
implemente por detrás. `src/catalogo/catalogo.ts` sigue consultando `db`
(`../db/cliente.ts`) directo, como ya lo hace. El puerto de salida del
hexágono (ADR 0016) queda **pospuesto**, no descartado: la entrada
correspondiente en `docs/decisiones-pendientes.md` (§5) fija el disparador que
lo va a reabrir.

## Contexto

El ADR 0016 (arquitectura hexagonal de la capa web) fijó el hexágono completo
—núcleo, puerto de entrada, adaptador de entrada, puerto de salida, adaptador
de salida— pero dejó **explícitamente afuera de su alcance** una sola pieza: el
puerto de salida. La razón que dio entonces sigue vigente hoy: la decisión toca
tres dueños a la vez —el módulo, el esquema y la importación— y no la puede
tomar la capa web sola. Quedó abierta como ticket #60.

Estado real del árbol al tomar esta decisión: un solo desarrollador, producto
sin validar, cero usuarios. Una sola tabla (`entidad`, ADR 0001), un solo motor
(PostgreSQL, local en Docker y gestionado en Neon, mismo driver `pg` en los dos
entornos, ADR 0006) y un solo ORM (Drizzle, ADR 0005). El módulo `catalogo`
tiene exactamente tres funciones (`listarPorTipo`, `obtenerPorSlug`,
`listarSlugs`, ADR 0016 Regla 1) y las tres usan Drizzle directo. Sus pruebas
(`src/catalogo/catalogo.test.ts`) corren contra PostgreSQL real vía
`docker compose up -d`, no contra un doble. No existe pipeline de CI en el
repositorio (no hay `.github/workflows/`): hoy, local o remoto, todo asume
Docker levantado.

## Problema

¿Conviene que `catalogo` declare una interfaz de persistencia intercambiable
—con Drizzle como una implementación detrás de ella— en vez de importar `db`
directo? El ticket #60 ya nombra las dos caras: en contra, boilerplate
concreto (la interfaz, los mapeadores entre `FilaEntidad` y lo que la interfaz
exponga, el doble de prueba) en un proyecto de un solo desarrollador con una
sola tabla; a favor, poder probar el módulo sin PostgreSQL levantado, que hoy
no se puede.

## Alternativas consideradas

### A. Adoptar el puerto ahora
Declarar una interfaz de persistencia (p. ej. `RepositorioDeEntidades` con las
mismas tres firmas que ya tiene el módulo, devolviendo `FilaEntidad` cruda para
que `aEntidad`/`validarDatos` sigan siendo responsabilidad de `catalogo.ts`) y
mover el uso de Drizzle a un adaptador que la implemente.

### B. Posponer
Dejar `catalogo.ts` como está —Drizzle directo— y anotar la pregunta como
abierta, con un disparador concreto que la reabra.

### C. Descartar
Decidir que el puerto de salida no se va a introducir nunca en este módulo,
cerrando la pregunta para siempre.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ------------------ |
| A. Adoptar ahora | El módulo se puede probar sin Postgres levantado; hexágono completo desde ya | Boilerplate real hoy sin un segundo adaptador que lo justifique: interfaz, mapeador, doble de prueba, para **una** implementación | Bajo (agregar la interfaz más adelante es un cambio interno del módulo, no toca la capa web) |
| B. Posponer | Cero costo hoy; la decisión se retoma con información real cuando aparezca la presión concreta | El módulo sigue sin poder probarse sin Docker mientras tanto | Bajo — es la opción reversible por diseño |
| C. Descartar | Cierra la pregunta, nada que mantener después | Es una afirmación fuerte ("nunca") sobre un futuro que hoy no se conoce; si aparece un segundo adaptador real, cerrar esto ahora obligaría a reabrir la discusión igual, con el costo agregado de tener que revertir una decisión "definitiva" | Alto (revertir un "nunca" pesa más que reabrir un "todavía no") |

## Decisión elegida

**Alternativa B: posponer.**

## Motivo

Aplicando la regla de la puerta del proyecto a la Alternativa A: el problema
concreto que resolvería (probar sin Postgres levantado) no está doliendo hoy
—las seis pruebas de `catalogo.test.ts` corren rápido contra Docker, que ya es
un prerrequisito del flujo de desarrollo, y no hay CI que se beneficie de
evitarlo—. Lo que sí es concreto es el costo: una interfaz con **una sola**
implementación real, para siempre, es exactamente la capa vacía que el ADR 0016
ya advirtió que hay que evitar ("un puerto no es un `interface` de una sola
implementación escrito por deporte"). El propio `backend-specialist` lo nombra
con el criterio que usa para todo el equipo de backend: *"una implementación es
hipótesis, dos es real"* — hoy hay una, Drizzle sobre Postgres, y ningún
candidato a segunda.

Desde el esquema, el `database-specialist` agrega que la variabilidad del
sistema ya tiene su punto de extensión: el `datos` JSONB tipado por descriptor
(ADR 0001) permite agregar un tipo de entidad sin tocar el esquema ni la
persistencia. No hace falta una segunda capa de indirección para lograr algo
que el diseño de la tabla ya resuelve.

Los dos especialistas convergen en la misma recomendación —posponer, no
adoptar ni descartar— y en el mismo motivo: falta la segunda pieza (un segundo
adaptador, un CI que sufra con Postgres, un segundo motor de persistencia) que
haría que la interfaz pague su costo. Descartar (Alternativa C) tampoco
corresponde: cerrar la pregunta "para siempre" es una afirmación sobre un
futuro que hoy no se conoce, y el costo de revertir un "nunca" es mayor que el
de revisar un "todavía no" cuando aparezca la señal.

Esto no contradice al ADR 0016: la capa web sigue viendo solo el puerto de
entrada (`src/catalogo/catalogo.ts`), y ninguna de sus once reglas cambia. El
hexágono queda con su puerto de salida implícito —Drizzle es, de hecho, el
único adaptador de salida— hasta que exista una razón concreta para hacerlo
explícito.

## Consecuencias

**Aceptamos:**
- El módulo `catalogo` sigue sin poder probarse sin PostgreSQL levantado. Sus
  pruebas dependen de `docker compose up -d`.
- Si en el futuro aparece un segundo adaptador de persistencia, la
  refactorización para introducir el puerto se hace entonces, no ahora.

**Obtenemos:**
- Cero boilerplate nuevo: sin interfaz, sin mapeador, sin doble de prueba, para
  un módulo con una tabla y tres funciones.
- La pregunta queda escrita y con disparador, en vez de decidirse sola por
  acumulación o quedar indefinidamente abierta sin criterio de reapertura.

**Deuda técnica asumida:**
- Ninguna nueva: seguir con Drizzle directo es el estado actual del árbol, no
  un atajo que se introduce con esta decisión.

**Revisar si:**
- Ver la entrada §5 de `docs/decisiones-pendientes.md`, que reemplaza al
  ticket #60 como el lugar donde vive esta pregunta hasta que se cumpla el
  disparador.
