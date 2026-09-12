/**
 * Mock de las estadísticas del catálogo que muestra el hero de la home
 * (ticket #65): fichas publicadas, tipos de entidad y tarjetas de repaso.
 *
 * `obtenerEstadisticasCatalogo` anticipa la firma de la consulta real que
 * algún día va a vivir en el módulo `catalogo` (ADR 0002: la capa web no
 * consulta la base de datos, le pide al módulo) — async, sin argumentos,
 * devuelve `EstadisticaCatalogo[]`. Cuando esa función exista, el cambio en
 * `estadisticas-catalogo.tsx` va a ser de import, no de componentes.
 *
 * Conectar estos tres valores a datos reales es fuera de alcance de esta
 * rebanada: los tres están fijos a propósito.
 */

export type EstadisticaCatalogo = {
  id: string;
  valor: number;
  etiqueta: string;
};

const ESTADISTICAS: EstadisticaCatalogo[] = [
  { id: "fichas-publicadas", valor: 64, etiqueta: "Fichas publicadas" },
  { id: "tipos-de-entidad", valor: 7, etiqueta: "Tipos de entidad" },
  { id: "tarjetas-de-repaso", valor: 212, etiqueta: "Tarjetas de repaso" },
];

export async function obtenerEstadisticasCatalogo(): Promise<EstadisticaCatalogo[]> {
  return ESTADISTICAS;
}
