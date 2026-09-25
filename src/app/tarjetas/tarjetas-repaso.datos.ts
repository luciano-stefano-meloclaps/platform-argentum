/**
 * DATOS SIMULADOS (ticket #91, forma ajustada en #132): el mazo que muestra la
 * pantalla "Tarjetas". No hay conexión a ningún módulo ni a la base — mismo
 * criterio que `ficha-entidad.datos.ts` y `quiz-pregunta.datos.ts`.
 *
 * SU FORMA NO ES UN CONTRATO. El módulo `aprendizaje` no existe y nadie
 * aprobó su interfaz (`docs/decisiones-pendientes.md` §4): cuando llegue se
 * diseña desde cero, y si la firma que sale es distinta, la que se cambia es
 * la de esta pantalla. Ni `MazoDeRepaso`, ni `TarjetaDeRepaso` ni
 * `obtenerMazoDeRepaso` deben citarse como la interfaz de ese módulo. La
 * forma de la carta ya cambió una vez en este mock (#132: `esVerdadero`
 * separado del texto) sin ningún ADR, justamente porque no es contrato.
 *
 * HOY NO SE MUESTRA `respuesta`: el dorso muestra solo «Verdadero» o «Falso»
 * (según `esVerdadero`). La explicación queda en los datos para cuando haya
 * lógica que la use.
 */

/** Una tarjeta del mazo: pregunta de un lado, respuesta del otro (CONTEXT.md). */
export type TarjetaDeRepaso = {
  /** Id estable dentro del mazo simulado: sirve de `key` y de identidad de la carta. */
  id: string;
  /** Numeral romano decorativo de la esquina de la carta (aria-hidden). */
  numeral: string;
  /** La sala/temática de la tarjeta ("Próceres") — la etiqueta del frente. */
  categoria: string;
  pregunta: string;
  /** Si la afirmación de la pregunta es verdadera. Separado del texto a propósito. */
  esVerdadero: boolean;
  /** La explicación de la respuesta. Hoy la vista no la muestra (ver el encabezado). */
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
      id: "san-martin-andes",
      numeral: "I",
      categoria: "Próceres",
      pregunta: "¿Cruzó la cordillera de los Andes al frente de un ejército propio, en 1817?",
      esVerdadero: true,
      respuesta: "José de San Martín cruzó los Andes en 1817 y venció en Chacabuco y Maipú.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      id: "belgrano-bandera",
      numeral: "II",
      categoria: "Próceres",
      pregunta: "¿Creó la bandera argentina en las barrancas del río Paraná, en Rosario?",
      esVerdadero: true,
      respuesta: "Manuel Belgrano izó por primera vez la bandera el 27 de febrero de 1812.",
      entidadId: "manuel-belgrano",
      entidadNombre: "Manuel Belgrano",
    },
    {
      id: "laprida-tucuman",
      numeral: "III",
      categoria: "Próceres",
      pregunta: "¿Presidió el Congreso de Tucumán que declaró la independencia en 1816?",
      esVerdadero: false,
      respuesta: "Quien lo presidió fue Francisco Narciso de Laprida, no un militar de campaña.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      id: "san-martin-yapeyu",
      numeral: "IV",
      categoria: "Próceres",
      pregunta: "¿Nació en Yapeyú, Corrientes, en 1778?",
      esVerdadero: true,
      respuesta: "José de San Martín nació en Yapeyú el 25 de febrero de 1778.",
      entidadId: "jose-de-san-martin",
      entidadNombre: "José de San Martín",
    },
    {
      id: "belgrano-primera-junta",
      numeral: "V",
      categoria: "Próceres",
      pregunta: "¿Fue el primer vocal de la Primera Junta, en 1810?",
      esVerdadero: false,
      respuesta: "Fue vocal de la Primera Junta, pero no el primero — la presidió Cornelio Saavedra.",
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
 * Devuelve el mazo simulado. Async y sin argumentos solo por comodidad de la
 * pantalla; no anticipa ninguna firma de módulo (ver el encabezado).
 */
export async function obtenerMazoDeRepaso(): Promise<MazoDeRepaso> {
  return MAZO_PROCERES;
}
