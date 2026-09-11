/**
 * Mock de las cantidades de entidades por tipo que muestra la sección "Las
 * salas del catálogo" de la home (ticket #71). "Entidades" y no "fichas":
 * CONTEXT.md reserva **Ficha** para la página que muestra una entidad
 * completa a un lector, y lo que se cuenta acá son entidades, no páginas.
 *
 * `contarEntidadesPorTipo` anticipa la firma de la consulta real que algún
 * día va a vivir en el módulo `catalogo` (ADR 0002: la capa web no consulta
 * la base de datos, le pide al módulo) — async, un tipo como argumento,
 * devuelve un número. Cuando esa función exista, el cambio en
 * `salas-del-catalogo.tsx` va a ser de import, no de componentes. Mismo
 * patrón que `estadisticas-catalogo.datos.ts` del ticket #65.
 *
 * `SalaTipo` es un tipo **local a esta pantalla**, no el `Tipo` del registro
 * de descriptores (`src/catalogo/descriptores/registro.ts`): hoy ese
 * registro solo conoce `procer` — los otros cinco tipos todavía no tienen
 * descriptor ni contenido (fuera de alcance de esta rebanada) — así que no
 * hay un tipo real con el que tipar los otros cinco. Cuando cada tipo tenga
 * su descriptor, este archivo se reemplaza por la consulta real y `SalaTipo`
 * deja de existir.
 *
 * Conectar estas seis cantidades a datos reales es fuera de alcance de esta
 * rebanada: los seis valores están fijos a propósito.
 */

export type SalaTipo = "procer" | "monumento" | "naturaleza" | "comida" | "fecha-patria" | "animal";

const CANTIDADES: Record<SalaTipo, number> = {
  procer: 8,
  monumento: 5,
  naturaleza: 6,
  comida: 7,
  "fecha-patria": 4,
  animal: 9,
};

export async function contarEntidadesPorTipo(tipo: SalaTipo): Promise<number> {
  return CANTIDADES[tipo];
}
