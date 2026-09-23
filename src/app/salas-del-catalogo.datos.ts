import { listarPorTipo } from "../catalogo/catalogo.ts";

/**
 * Las cantidades de entidades por tipo que muestra la sección "Las salas del
 * catálogo" de la home. "Entidades" y no "fichas": CONTEXT.md reserva
 * **Ficha** para la página que muestra una entidad completa a un lector, y lo
 * que se cuenta acá son entidades, no páginas.
 *
 * Consulta real desde acá en adelante (ticket #88): `contarEntidadesPorTipo`
 * le pide al módulo `catalogo` la lista de entidades de cada tipo
 * (`listarPorTipo`, ADR 0002 — la capa web no consulta la base de datos, le
 * pide al módulo) y toma la longitud. No hay una cuarta función del módulo
 * para "contar": se reusa la que ya existe.
 *
 * `SalaTipo` es un tipo **local a esta pantalla**, no el `Tipo` del registro
 * de descriptores (`src/catalogo/descriptores/registro.ts`): hoy ese
 * registro solo conoce `procer` — los otros cinco tipos todavía no tienen
 * descriptor ni contenido (fuera de alcance de esta rebanada). El valor de
 * cada literal es, a propósito, el mismo string que va a usar el
 * discriminador `tipo` de la tabla `entidad` (ADR 0001) el día que cada uno
 * tenga su descriptor — es el identificador que cruza la costura con el
 * módulo, no el nombre visible de la sala.
 *
 * `listarPorTipo` acepta un `tipo: string` que el compilador no puede probar
 * que pertenece al registro (ver el segundo overload en `catalogo.ts`) y
 * devuelve `[]` para los tipos sin descriptor, sin lanzar y sin consultar la
 * base — así que llamarla con cualquiera de los seis `SalaTipo` de hoy
 * compila y da un conteo real: `14` reales para `procer` (o los que haya
 * cargados) y `0`, honesto, para los cinco que todavía no tienen descriptor.
 * Esta pantalla **no** importa el registro de descriptores para decidir qué
 * tipos "existen hoy": ADR 0016 prohíbe justo ese import desde la capa web.
 * Cuando cada tipo tenga su descriptor, nada de este archivo cambia — el
 * conteo pasa de `0` a real solo.
 */

export type SalaTipo = "procer" | "monumento" | "naturaleza" | "comida" | "fecha-patria" | "animal";

/**
 * Los seis tipos de sala, en el orden en que se muestran. Única lista de la
 * que dependen tanto el desglose por sala como el total del hero (ver
 * `obtenerCantidadTotalDeSalas`), para que las dos cifras no puedan
 * desincronizarse.
 */
export const SALA_TIPOS: readonly SalaTipo[] = ["procer", "monumento", "naturaleza", "comida", "fecha-patria", "animal"];

export async function contarEntidadesPorTipo(tipo: SalaTipo): Promise<number> {
  const entidades = await listarPorTipo(tipo);

  return entidades.length;
}

/**
 * El total de entidades sumando las seis salas. Es la fuente que usa el hero
 * (`estadisticas-catalogo.datos.ts`) para "Fichas publicadas": suma los
 * mismos seis conteos que arma la grilla de salas, así que las dos cifras
 * nunca pueden desincronizarse (criterio de aceptación del ticket #88).
 */
export async function obtenerCantidadTotalDeSalas(): Promise<number> {
  const cantidades = await Promise.all(SALA_TIPOS.map((tipo) => contarEntidadesPorTipo(tipo)));

  return cantidades.reduce((total, cantidad) => total + cantidad, 0);
}
