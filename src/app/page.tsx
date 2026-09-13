import { Hero } from "./hero.tsx";
import { SalasDelCatalogo } from "./salas-del-catalogo.tsx";

/**
 * La home de la aplicación: el hero (ticket #65) —eyebrow, título, divisor,
 * bajada y la barra de estadísticas del catálogo— seguido de "Las salas del
 * catálogo" (ticket #71), ambos dentro del mismo `<main>`.
 *
 * `flex flex-1 flex-col` acá: `<body>` (`layout.tsx`) es la columna flex
 * `min-h-dvh` que reparte Header + `<main>`, así que este `<main>` necesita
 * ser también flex item (`flex-1`, para recibir el espacio que el Header no
 * usa) *y* a la vez contenedor flex-column (`flex flex-col`), porque el
 * `<Hero />` de adentro es el que lleva su propio `flex-1` (ver `hero.tsx`)
 * y ese `flex-1` solo funciona contra el padre inmediato — sin este cambio,
 * `<main>` seguía sin ser flex y el `flex-1` del Hero no tenía contra qué
 * crecer. `<SalasDelCatalogo />`, al no llevar `flex-1`, se queda en su alto
 * natural debajo del Hero: no le "roba" espacio, y si el contenido total
 * supera la ventana, el scroll de la página sigue siendo el normal.
 */
export default function Home() {
  return (
    <main id="contenido" className="flex flex-1 flex-col">
      <Hero />
      <SalasDelCatalogo />
    </main>
  );
}
