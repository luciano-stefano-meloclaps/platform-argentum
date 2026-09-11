import { Hero } from "./hero.tsx";
import { SalasDelCatalogo } from "./salas-del-catalogo.tsx";

/**
 * La home de la aplicación: el hero (ticket #65) —eyebrow, título, divisor,
 * bajada y la barra de estadísticas del catálogo— seguido de "Las salas del
 * catálogo" (ticket #71), ambos dentro del mismo `<main>`.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <SalasDelCatalogo />
    </main>
  );
}
