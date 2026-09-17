import type { Metadata } from "next";

import { obtenerQuizMock } from "./quiz-pregunta.datos.ts";
import { QuizPregunta } from "./quiz-pregunta.tsx";

/**
 * La pantalla "Quiz" (ticket #94): repaso de opción múltiple contra el mock
 * de `quiz-pregunta.datos.ts`. Presentación pura, sin conexión a ningún
 * módulo ni a la base — el módulo `aprendizaje` (ADR 0002) todavía no
 * existe, mismo estado que `/tarjetas` (ticket #91) antes de su nota de
 * revisión #92.
 *
 * Server Component: solo lee el mock y se lo pasa al Client Component.
 * Ningún callback se pasa a propósito — no hay pantalla de destino más allá
 * del link a `/ficha`, que `QuizPregunta` arma como navegación real
 * (`<Link>`), no como acción de cliente.
 */

export const metadata: Metadata = {
  title: "Quiz | Argentum",
};

export default async function PaginaDeQuiz() {
  const quiz = await obtenerQuizMock();

  return (
    <QuizPregunta
      pregunta={quiz.pregunta}
      progreso={quiz.progreso}
      aciertos={quiz.aciertos}
      errores={quiz.errores}
    />
  );
}
