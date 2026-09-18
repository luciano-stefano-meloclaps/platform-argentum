/**
 * Mock de la pregunta que muestra la pantalla "Quiz" (ticket #94):
 * presentación pura, sin conexión a ningún módulo ni a la base — mismo
 * criterio que `salas-del-catalogo.datos.ts`, `ficha-entidad.datos.ts` y
 * `tarjetas-repaso.datos.ts`. `obtenerQuizMock` anticipa la firma de la
 * consulta real que algún día va a vivir en el módulo `aprendizaje` (ADR
 * 0002: la capa web no consulta la base de datos, le pide al módulo) —
 * async, sin argumentos todavía porque hoy no hay selección de quiz, devuelve
 * el estado completo de la pregunta actual más el resumen de las 10.
 *
 * El ticket solo pide **una** pregunta completa (enunciado, categoría/sala,
 * 4 opciones, pista, explicación y entidad relacionada) y un `progreso[]`
 * de 10 estados para que el tracker se vea con su lógica real — no hace
 * falta mockear las 10 preguntas enteras.
 */

/** Una de las cuatro opciones de respuesta, A a D. */
export type OpcionDeQuiz = {
  letra: "A" | "B" | "C" | "D";
  texto: string;
  esCorrecta: boolean;
};

/**
 * El estado de una posición del tracker de 10 preguntas. "Correcta" e
 * "incorrecta" son preguntas ya respondidas; "actual" es la que se está
 * jugando ahora; "pendiente" todavía no se jugó.
 */
export type EstadoDePregunta = "correcta" | "incorrecta" | "actual" | "pendiente";

export type ProgresoDePregunta = {
  numero: number;
  estado: EstadoDePregunta;
};

/** La pregunta que se está jugando, con todo lo que necesita la pantalla. */
export type PreguntaDeQuiz = {
  /** Posición dentro de las 10, 1-indexado — para el kicker "pregunta N de 10". */
  numero: number;
  totalPreguntas: number;
  /**
   * El tipo de la entidad detrás de la pregunta, para el tag — "tipo", no
   * "categoría": CONTEXT.md fija ese término para "la clase a la que
   * pertenece una entidad" y marca "categoría" explícitamente a evitar.
   */
  tipo: string;
  enunciado: string;
  pista: string;
  opciones: OpcionDeQuiz[];
  /** El porqué de la respuesta correcta, para el panel de feedback. */
  explicacion: string;
  /** La entidad del catálogo detrás de la pregunta, para el link del feedback. */
  entidadNombre: string;
  entidadHref: string;
};

/** El estado completo que consume la pantalla "Quiz". */
export type QuizMock = {
  pregunta: PreguntaDeQuiz;
  /** Los 10 estados del tracker, uno por posición del quiz. */
  progreso: ProgresoDePregunta[];
  aciertos: number;
  errores: number;
};

const PREGUNTA_ACTUAL: PreguntaDeQuiz = {
  numero: 4,
  totalPreguntas: 10,
  tipo: "Próceres",
  enunciado: "¿Quién izó por primera vez la bandera argentina en las barrancas del río Paraná, en 1812?",
  pista: "Fue el creador de la escarapela, meses antes de este mismo gesto.",
  opciones: [
    { letra: "A", texto: "José de San Martín", esCorrecta: false },
    { letra: "B", texto: "Manuel Belgrano", esCorrecta: true },
    { letra: "C", texto: "Cornelio Saavedra", esCorrecta: false },
    { letra: "D", texto: "Mariano Moreno", esCorrecta: false },
  ],
  explicacion:
    "Manuel Belgrano izó la bandera por primera vez el 27 de febrero de 1812, en Rosario, a orillas del Paraná — un año antes de que el Congreso la adoptara como enseña nacional.",
  entidadNombre: "Manuel Belgrano",
  entidadHref: "/ficha",
};

const PROGRESO_MOCK: ProgresoDePregunta[] = [
  { numero: 1, estado: "correcta" },
  { numero: 2, estado: "correcta" },
  { numero: 3, estado: "incorrecta" },
  { numero: 4, estado: "actual" },
  { numero: 5, estado: "pendiente" },
  { numero: 6, estado: "pendiente" },
  { numero: 7, estado: "pendiente" },
  { numero: 8, estado: "pendiente" },
  { numero: 9, estado: "pendiente" },
  { numero: 10, estado: "pendiente" },
];

const QUIZ_MOCK: QuizMock = {
  pregunta: PREGUNTA_ACTUAL,
  progreso: PROGRESO_MOCK,
  aciertos: 2,
  errores: 1,
};

/**
 * Anticipa la firma de la consulta real, igual que `obtenerEntidadDeFicha` y
 * `obtenerMazoDeRepaso`: async, sin argumentos porque hoy no hay selección de
 * quiz (no hay módulo `aprendizaje` todavía). Cuando esa función exista, el
 * cambio en `quiz-pregunta.tsx`/`page.tsx` es de import, no de componentes.
 */
export async function obtenerQuizMock(): Promise<QuizMock> {
  return QUIZ_MOCK;
}
