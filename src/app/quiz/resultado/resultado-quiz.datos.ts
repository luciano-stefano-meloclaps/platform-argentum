/**
 * Mock del resultado que muestra la pantalla "Resultado del quiz"
 * (ticket #106): presentación pura, **datos simulados**, sin conexión a
 * ningún módulo ni a la base — mismo criterio que
 * `quiz-pregunta.datos.ts`, `tarjetas-repaso.datos.ts` y
 * `ficha-entidad.datos.ts`.
 *
 * `obtenerResultadoDeQuizMock` anticipa la firma de la consulta real que
 * algún día va a vivir repartida entre **dos** módulos futuros (ADR 0002:
 * la capa web no consulta la base de datos, le pide al módulo):
 *
 * - el módulo **`aprendizaje`** sería el dueño de la partida en sí —
 *   aciertos sobre el total, tiempo empleado y la revisión pregunta por
 *   pregunta con la respuesta que dio el visitante;
 * - el módulo **`progreso`** sería el dueño de los puntos y de la liga —
 *   la liga es una función pura del total de puntos (`CONTEXT.md`), así que
 *   no se guarda, se calcula al leer.
 *
 * Esa firma anticipada **no es un contrato**: ver
 * `docs/decisiones-pendientes.md` §4. Cuando los módulos existan, esta
 * pantalla puede terminar leyendo de dos funciones en vez de una, y el
 * tipo de acá no obliga a nadie.
 *
 * Nada se persiste: la identidad del visitante sigue sin decidirse y su
 * regla interina dice que hasta la rebanada de progreso no se guarda nada
 * (`docs/decisiones-pendientes.md`). Esta pantalla solo muestra.
 *
 * Vocabulario: **puntos** (nunca "puntaje", marcado a evitar en
 * `CONTEXT.md`), **liga** (nunca "nivel"), **tarjeta**, **ficha**,
 * **quiz**, **entidad**.
 */

/** El nombre de una de las cuatro ligas, en el orden que fija `CONTEXT.md`. */
export type NombreDeLiga = "Cobre" | "Plata" | "Oro" | "Litio";

/**
 * Una línea de la revisión de la partida: qué se preguntó, qué respondió el
 * visitante, y si acertó. Cuando falló, la línea ofrece el acceso a la
 * ficha de la entidad detrás de la pregunta — para que el error enseñe en
 * vez de castigar.
 */
export type RevisionDePregunta = {
  /** Posición dentro de la partida, 1-indexado. La pantalla lo muestra en numeral romano. */
  numero: number;
  enunciado: string;
  /** Lo que el visitante respondió, tal como lo eligió. */
  respuestaDada: string;
  acerto: boolean;
  /**
   * La entidad detrás de la pregunta. Presente solo cuando el visitante
   * falló: es el único caso en que la pantalla ofrece el acceso a su ficha.
   */
  entidad?: {
    nombre: string;
    href: string;
  };
};

/** El estado completo que consume la pantalla "Resultado del quiz". */
export type ResultadoDeQuizMock = {
  /** El tipo de entidad sobre el que fue el quiz, para el tag del encabezado. */
  tipo: string;
  aciertos: number;
  totalPreguntas: number;
  /** Los puntos que sumó esta partida. Nunca "puntaje". */
  puntosSumados: number;
  /** El tiempo total de la partida, ya formateado como lo muestra la pantalla. */
  tiempoTotal: string;
  /** La liga en la que cae el total de puntos del visitante. */
  liga: NombreDeLiga;
  /** La liga que sigue. Ausente cuando ya está en la última (Litio). */
  ligaSiguiente?: NombreDeLiga;
  /** Cuántos puntos le faltan para entrar en `ligaSiguiente`. */
  puntosParaLaSiguiente: number;
  /** Una frase corta de cierre, en la voz de la plataforma. */
  resumen: string;
  /** La revisión de la partida. El ticket pide cinco líneas como resumen de las diez. */
  revision: RevisionDePregunta[];
};

const REVISION_MOCK: RevisionDePregunta[] = [
  {
    numero: 1,
    enunciado: "Ciudad del Cabildo de la Primera Junta",
    respuestaDada: "Buenos Aires",
    acerto: true,
  },
  {
    numero: 2,
    enunciado: "Año de inauguración del Teatro Colón",
    respuestaDada: "1898",
    acerto: false,
    entidad: { nombre: "Teatro Colón", href: "/ficha" },
  },
  {
    numero: 3,
    enunciado: "Provincia de la Casa de Tucumán",
    respuestaDada: "Tucumán",
    acerto: true,
  },
  {
    numero: 4,
    enunciado: "Autor del Monumento a la Bandera",
    respuestaDada: "Buschiazzo",
    acerto: false,
    entidad: { nombre: "Monumento a la Bandera", href: "/ficha" },
  },
  {
    numero: 5,
    enunciado: "Altura del Obelisco",
    respuestaDada: "67 metros",
    acerto: true,
  },
];

/*
 * Los números del mock son coherentes entre sí a propósito, para que la
 * pantalla no muestre una combinación imposible: el total de puntos del
 * visitante cae en la franja de Plata (501–1500, `CONTEXT.md`), y los 640
 * que le faltan son exactamente los que lo llevarían al piso de Oro
 * (1501). La liga no se guarda: se calcula del total de puntos.
 */
const RESULTADO_MOCK: ResultadoDeQuizMock = {
  tipo: "Monumentos",
  aciertos: 7,
  totalPreguntas: 10,
  puntosSumados: 140,
  tiempoTotal: "4:12",
  liga: "Plata",
  ligaSiguiente: "Oro",
  puntosParaLaSiguiente: 640,
  resumen: "Buen repaso: sumaste 140 puntos.",
  revision: REVISION_MOCK,
};

/**
 * Anticipa la firma de la consulta real, igual que `obtenerQuizMock`:
 * async, sin argumentos porque hoy no hay partida que identificar (no hay
 * módulo `aprendizaje` ni `progreso` todavía, y no se persiste nada).
 * Cuando esas funciones existan, el cambio en `page.tsx` es de import, y
 * `ResultadoQuiz` no se toca.
 */
export async function obtenerResultadoDeQuizMock(): Promise<ResultadoDeQuizMock> {
  return RESULTADO_MOCK;
}
