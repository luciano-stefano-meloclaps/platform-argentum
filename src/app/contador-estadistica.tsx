"use client";

import { useEffect, useState } from "react";

const DURACION_MS = 900;
const formateador = new Intl.NumberFormat("es-AR");

/** Ease-out cúbica: arranca rápido y frena hacia el valor final. */
function easeOut(progreso: number): number {
  return 1 - Math.pow(1 - progreso, 3);
}

/**
 * El número animado de un bloque de estadística (ticket #65).
 *
 * Única isla de cliente de esta pantalla: necesita `useState`, `useEffect`
 * y `requestAnimationFrame`, que no existen en un Server Component.
 *
 * El estado arranca en el `valor` final, no en 0: así, sin JS o antes de
 * hidratar, lo que se ve ya es el dato correcto — la animación es un
 * agregado visual, nunca la única vía para conocer el número. Recién en el
 * efecto, si `prefers-reduced-motion` no pide lo contrario, se reinicia a 0
 * y sube hasta el valor final en ~900ms con una curva ease-out.
 */
export function ContadorEstadistica({ valor }: { valor: number }) {
  const [valorMostrado, setValorMostrado] = useState(valor);

  useEffect(() => {
    const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMovimientoReducido) return;

    setValorMostrado(0);

    const inicio = performance.now();
    let idCuadro = requestAnimationFrame(function animar(ahora) {
      const progreso = Math.min((ahora - inicio) / DURACION_MS, 1);
      setValorMostrado(Math.round(valor * easeOut(progreso)));

      if (progreso < 1) {
        idCuadro = requestAnimationFrame(animar);
      }
    });

    return () => cancelAnimationFrame(idCuadro);
  }, [valor]);

  return <>{formateador.format(valorMostrado)}</>;
}
