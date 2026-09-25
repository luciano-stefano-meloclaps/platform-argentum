/**
 * Mock del mazo que muestra la pantalla "Tarjetas" (ticket #91): presentación
 * pura, sin conexión a ningún módulo ni a la base — mismo criterio que
 * `salas-del-catalogo.datos.ts`, `estadisticas-catalogo.datos.ts` y
 * `ficha-entidad.datos.ts`. `obtenerMazoDeRepaso` anticipa la firma de la
 * consulta real que algún día va a vivir en el módulo `aprendizaje` (ADR
 * 0002: la capa web no consulta la base de datos, le pide al módulo) —
 * async, sin argumentos todavía porque hoy no hay selección de mazo, devuelve
 * el mazo completo. Cuando esa función exista, el cambio en
 * `tarjetas-repaso.tsx`/`page.tsx` es de import, no de componentes.
 *
 * La forma exacta del contrato (qué mazo, cuántas tarjetas, qué estadísticas)
 * es una de las preguntas abiertas de la nota de revisión #92 — este mock
 * no la resuelve, solo le da una forma plausible para construir la pantalla.
 */

/** Una tarjeta del mazo: pregunta de un lado, respuesta del otro (CONTEXT.md). */
export type TarjetaDeRepaso = {
  /** Numeral romano decorativo de la esquina de la carta (aria-hidden). */
  numeral: string;
  /** La sala/temática de la tarjeta ("Próceres") — el tag morado del frente. */
  categoria: string;
  pregunta: string;
  respuesta: string;
  /** La entidad del catálogo que sustenta esta tarjeta. */
  entidadId: string;
  /** El nombre legible de esa entidad, para el link "Abrir la ficha de …". */
  entidadNombre: string;
};

export type NivelDeDominio = "Bajo" | "Medio" | "Alto";

/** Las estadísticas del propio mazo — no de la cuenta del visitante. */
export type EstadisticasDeMazo = {
  /** Aciertos del mazo actual; la vista los muestra como "aciertos/total de tarjetas". */
  aciertos: number;
  racha: number;
  dominio: NivelDeDominio;
  /** Ya formateado como texto de presentación, mismo criterio que `ficha-entidad.datos.ts`. */
  ultimoRepaso: string;
};

export type MazoDeRepaso = {
  nombre: string;
  tarjetas: TarjetaDeRepaso[];
  stats: EstadisticasDeMazo;
};

const MAZO_PROCERES: MazoDeRepaso = {
  nombre: "Próceres",
  tarjetas: [
    {
      numeral: "I",
      categoria: "Próceres",
      pregunta: "¿Cruzó la cordillera de los Andes al frente de un ejército propio, en 1817?",
      respuesta: "Sí: José de San Martín cruzó los Andes en 1817 y venció en Chacabuco y Maipú.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      numeral: "II",
      categoria: "Próceres",
      pregunta: "¿Creó la bandera argentina en las barrancas del río Paraná, en Rosario?",
      respuesta: "Sí: Manuel Belgrano izó por primera vez la bandera el 27 de febrero de 1812.",
      entidadId: "manuel-belgrano",
      entidadNombre: "Manuel Belgrano",
    },
    {
      numeral: "III",
      categoria: "Próceres",
      pregunta: "¿Presidió el Congreso de Tucumán que declaró la independencia en 1816?",
      respuesta: "No: quien lo presidió fue Francisco Narciso de Laprida, no un militar de campaña.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      numeral: "IV",
      categoria: "Próceres",
      pregunta: "¿Nació en Yapeyú, Corrientes, en 1778?",
      respuesta: "Sí: José de San Martín nació en Yapeyú el 25 de febrero de 1778.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      numeral: "V",
      categoria: "Próceres",
      pregunta: "¿Fue el primer vocal de la Primera Junta, en 1810?",
      respuesta: "No: fue vocal de la Primera Junta, pero no el primero — la presidió Cornelio Saavedra.",
      entidadId: "manuel-belgrano",
      entidadNombre: "Manuel Belgrano",
    },
  ],
  stats: {
    aciertos: 3,
    racha: 4,
    dominio: "Medio",
    ultimoRepaso: "hace 3 días",
  },
};

/**
 * Anticipa la firma de la consulta real, igual que `contarEntidadesPorTipo` y
 * `obtenerEntidadDeFicha`: async, sin argumentos porque hoy no hay selección
 * de mazo (fuera de alcance de esta rebanada, ver #92).
 */
export async function obtenerMazoDeRepaso(): Promise<MazoDeRepaso> {
  return MAZO_PROCERES;
}
