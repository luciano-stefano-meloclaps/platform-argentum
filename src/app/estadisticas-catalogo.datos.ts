/**
 * Las estadísticas del catálogo que muestra el hero de la home (ticket #65):
 * fichas publicadas, tipos de entidad y tarjetas de repaso.
 *
 * **"Fichas publicadas" es real desde el ticket #88**: no es un mock propio,
 * es `obtenerCantidadTotalDeSalas()` de `salas-del-catalogo.datos.ts` — la
 * misma suma de los seis conteos por sala que arma la grilla de "Las salas
 * del catálogo". Comparten la fuente a propósito (criterio de aceptación del
 * ticket #88): si esta cifra y la suma de las seis salas vinieran de dos
 * consultas separadas, podrían desincronizarse con solo cambiar una.
 *
 * "Tipos de entidad" y "Tarjetas de repaso" siguen mockeados: dependen del
 * módulo `aprendizaje` (tarjetas) y de que el registro de descriptores tenga
 * más de un tipo, ninguno de los dos existe todavía — fuera de alcance de
 * esta rebanada.
 */

import { obtenerCantidadTotalDeSalas } from "./salas-del-catalogo.datos.ts";

export type EstadisticaCatalogo = {
  id: string;
  valor: number;
  etiqueta: string;
};

export async function obtenerEstadisticasCatalogo(): Promise<EstadisticaCatalogo[]> {
  const fichasPublicadas = await obtenerCantidadTotalDeSalas();

  return [
    { id: "fichas-publicadas", valor: fichasPublicadas, etiqueta: "Fichas publicadas" },
    { id: "tipos-de-entidad", valor: 7, etiqueta: "Tipos de entidad" },
    { id: "tarjetas-de-repaso", valor: 212, etiqueta: "Tarjetas de repaso" },
  ];
}
