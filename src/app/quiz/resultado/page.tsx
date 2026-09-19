import type { Metadata } from "next";

import { obtenerResultadoDeQuizMock } from "./resultado-quiz.datos.ts";
import { ResultadoQuiz } from "./resultado-quiz.tsx";

/**
 * La pantalla "Resultado del quiz" (ticket #106): lo que ve el visitante al
 * terminar una partida de diez preguntas. Presentación pura contra el mock
 * de `resultado-quiz.datos.ts`, sin conexión a ningún módulo ni a la base —
 * los módulos `aprendizaje` y `progreso` (ADR 0002) todavía no existen,
 * mismo estado que `/quiz` (ticket #94) y `/tarjetas` (ticket #91).
 *
 * Vive en `/quiz/resultado`, dentro del árbol de `/quiz`, y no como una
 * ruta hermana de primer nivel: es el final de la misma partida, no otra
 * sección de la plataforma. El encadenamiento real desde la última pregunta
 * hacia acá está **fuera del alcance** del ticket, así que la ruta se
 * alcanza por URL y no hay todavía ningún `<Link>` que lleve a ella desde
 * `/quiz`.
 *
 * Server Component, y toda la pantalla también: el resultado es estático —
 * no hay inputs, no hay estado que cambie acá—, así que no hay ninguna isla
 * que justifique `'use client'`. Las tres piezas interactivas (el acceso a
 * la ficha de cada pregunta fallada y las dos salidas de abajo) son
 * navegación real con `<Link>`, no acciones de cliente.
 */

export const metadata: Metadata = {
  title: "Resultado del quiz | Argentum",
};

export default async function PaginaDeResultadoDeQuiz() {
  const resultado = await obtenerResultadoDeQuizMock();

  return <ResultadoQuiz resultado={resultado} />;
}
