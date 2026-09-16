/**
 * Mock de las seis entidades que muestra "Láminas destacadas" (ticket #89):
 * una vidriera curada, una entidad por sala, debajo de "Las salas del
 * catálogo" en la home. Mismo criterio que `salas-del-catalogo.datos.ts` y
 * `estadisticas-catalogo.datos.ts` (ticket #65): array local, sin tocar
 * `src/catalogo/`, con la firma que algún día va a exponer el módulo real.
 *
 * `meta` y `resumen` son texto de presentación de esta vidriera, no la
 * prosa de una ficha real —esa vive en `contenido/`, es del
 * `narrative-specialist` y sigue la voz de `voz-narrativa`—. `meta` es un
 * dato puntual confirmado por el usuario (fecha, lugar u otro hecho corto),
 * literal; `resumen` lo redacta esta pantalla en el mismo registro alto que
 * ya usan los demás mocks de esta pantalla (el epíteto y los párrafos de
 * `ficha-entidad.datos.ts`, el título del hero) a partir de los hechos
 * puntuales que el usuario confirmó para cada entidad, sin copiarlos
 * palabra por palabra: es la vidriera que enlaza justo a esas fichas, así
 * que un cambio brusco de tono entre la lámina y el destino sería
 * inconsistente.
 */

export type LaminaDestacada = {
  /** El nombre de la entidad, tal como se muestra en la lámina. */
  nombre: string;
  /** El nombre de la sala a la que pertenece, para el kicker dorado. */
  tipo: string;
  /** Metadato breve en itálica, una sola línea. */
  meta: string;
  /** Qué imagen falta, en el placeholder rayado: "retrato · óleo s. XIX". */
  slot: string;
  /** El resumen corto, 1-2 oraciones, centrado a `max-width: 34ch`. */
  resumen: string;
  /**
   * El identificador con el que `GrillaLaminas` (`grilla-laminas.tsx`)
   * decide adónde navegar al hacer click — ver `RUTA_POR_ENTIDAD` ahí. No
   * es un slug de `entidad` (ADR 0013): solo dos de las seis entidades
   * tienen ficha real u hoy mockeada, así que este campo es un
   * identificador de esta vidriera, no del catálogo.
   */
  entidadId: string;
};

export const LAMINAS_DESTACADAS: LaminaDestacada[] = [
  {
    nombre: "José de San Martín",
    tipo: "Próceres",
    meta: "1778 – 1850 · Yapeyú",
    slot: "retrato · óleo s. XIX",
    resumen: "Formó el Ejército de los Andes y cruzó la cordillera para liberar Chile y el Perú.",
    entidadId: "jose-de-san-martin",
  },
  {
    nombre: "Cataratas del Iguazú",
    tipo: "Naturaleza",
    meta: "Misiones · 275 saltos",
    slot: "fotografía · color",
    resumen: "El sistema de saltos de agua más grande del mundo truena en la frontera entre Argentina y Brasil.",
    entidadId: "cataratas-del-iguazu",
  },
  {
    nombre: "Cabildo de Buenos Aires",
    tipo: "Monumentos",
    meta: "1610 · Plaza de Mayo",
    slot: "grabado · s. XIX",
    resumen: "Sede del gobierno colonial y escenario de la Revolución de Mayo de 1810.",
    entidadId: "cabildo-de-buenos-aires",
  },
  {
    nombre: "Empanada",
    tipo: "Comidas",
    meta: "24 variantes regionales",
    slot: "lámina · ilustración",
    resumen: "Cada provincia defiende la suya: la salteña lleva papa, la tucumana se corta a cuchillo.",
    entidadId: "empanada",
  },
  {
    nombre: "25 de Mayo",
    tipo: "Fechas patrias",
    meta: "1810 · Revolución de Mayo",
    slot: "grabado · s. XIX",
    resumen: "Un cabildo abierto discutió el poder hasta parir la Primera Junta de gobierno.",
    entidadId: "25-de-mayo",
  },
  {
    nombre: "Hornero",
    tipo: "Animales",
    meta: "Ave nacional desde 1928",
    slot: "ilustración · naturalista",
    resumen: "Su nido de barro, cocido al sol, puede pesar hasta cinco kilos.",
    entidadId: "hornero",
  },
];
