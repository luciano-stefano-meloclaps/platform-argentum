import { SalasDelCatalogo } from "./salas-del-catalogo.tsx";

/**
 * La home de la aplicación. El hero real (ticket #65) todavía no está
 * mergeado en esta rama: el placeholder "Hello world!" queda como está, y
 * "Las salas del catálogo" (ticket #71) se agrega debajo, dentro del mismo
 * `<main>` — dos `<main>` en una página no es HTML semántico válido. Cuando
 * el hero llegue, este placeholder se reemplaza ahí, sin tocar esta sección.
 */
export default function Home() {
  return (
    <main>
      <div className="grid min-h-dvh place-items-center">
        <div>Hello world!</div>
      </div>
      <SalasDelCatalogo />
    </main>
  );
}
