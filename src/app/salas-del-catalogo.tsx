import Link from "next/link";

import { contarEntidadesPorTipo, type SalaTipo } from "./salas-del-catalogo.datos.ts";

/**
 * Una de las seis salas del catálogo: su número romano de orden, su tipo (para
 * pedirle la cantidad mockeada) y su nombre. `href` solo está presente en la
 * sala que enlaza a una ruta real — hoy, únicamente Próceres (`/catalogo`,
 * ticket #62). Las otras cinco no tienen tipo, descriptor ni ruta todavía
 * (fuera de alcance de esta rebanada): quedan sin `href`.
 */
type Sala = {
  numero: string;
  tipo: SalaTipo;
  nombre: string;
  href?: string;
};

const SALAS: Sala[] = [
  { numero: "I", tipo: "procer", nombre: "Próceres", href: "/catalogo" },
  { numero: "II", tipo: "monumento", nombre: "Monumentos" },
  { numero: "III", tipo: "naturaleza", nombre: "Naturaleza" },
  { numero: "IV", tipo: "comida", nombre: "Comidas" },
  { numero: "V", tipo: "fecha-patria", nombre: "Fechas patrias" },
  { numero: "VI", tipo: "animal", nombre: "Animales" },
];

/**
 * "Las salas del catálogo" (ticket #71): la grilla de seis salas, una por
 * cada tipo de entidad, debajo de lo que ya exista en la home.
 *
 * Server Component: solo lee el mock y arma el marcado, sin estado ni
 * interacción — no hace falta una isla de cliente acá.
 *
 * Las seis cantidades se piden en paralelo con `Promise.all` (no una detrás
 * de otra) para no armar una cascada de espera.
 */
export async function SalasDelCatalogo() {
  const salas = await Promise.all(
    SALAS.map(async (sala) => ({ ...sala, cantidad: await contarEntidadesPorTipo(sala.tipo) })),
  );

  return (
    <section className="mx-auto max-w-5xl px-lg py-2xl">
      <h2 className="text-pretty font-titulo text-label uppercase tracking-widest text-texto-titulo">
        Las salas del catálogo
      </h2>

      <ul className="mt-xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
        {salas.map((sala) => (
          <li key={sala.tipo}>
            <BloqueSala sala={sala} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * "Bloque" y no "tarjeta": CONTEXT.md reserva **Tarjeta** para la unidad de
 * repaso (pregunta de un lado, respuesta del otro) — mismo criterio que ya
 * aplicó `estadisticas-catalogo.tsx` del ticket #65 para su barra de
 * estadísticas.
 */
function BloqueSala({ sala }: { sala: Sala & { cantidad: number } }) {
  const contenido = (
    <>
      {/*
       * Decorativo: el orden de la sala ya lo transmite su posición en la
       * lista, así que el numeral romano se oculta a lectores de pantalla en
       * vez de anunciarse letra por letra (p. ej. "II" como "i, i").
       */}
      <span aria-hidden="true" className="font-titulo text-h2 text-accent-700">
        {sala.numero}
      </span>
      <div aria-hidden="true" className="my-sm h-px w-10 bg-celeste-400" />
      <h3 className="text-pretty font-titulo text-h2 text-texto-titulo">{sala.nombre}</h3>
      <p className="mt-xs font-cuerpo text-chip uppercase text-texto-terciario">{sala.cantidad} entidades</p>
    </>
  );

  if (sala.href !== undefined) {
    return (
      <Link
        href={sala.href}
        className="block h-full rounded-xl border border-borde-default bg-blanco p-lg shadow-sombra-sm motion-safe:transition-shadow hover:shadow-sombra-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
      >
        {contenido}
      </Link>
    );
  }

  // Sala sin ruta todavía (sin `href`): no es un link roto ni promete una
  // página que da 404, así que no se envuelve en `<Link>` ni lleva ningún
  // manejador de click. Se distingue de una sala activa por tres cosas a la
  // vez, ninguna de ellas el color: no reacciona al pasar el mouse ni tiene
  // foco (no es interactiva), el borde es punteado en vez de sólido, y lleva
  // la etiqueta de texto "Próximamente" — la señal que un lector de pantalla
  // también recibe.
  return (
    <div className="relative h-full rounded-xl border border-dashed border-borde-default bg-crema p-lg">
      {/*
       * `text-texto-secundario`, no `text-texto-terciario`: sobre
       * `bg-arena-borde-suave` (más clara que `--color-crema`, la única
       * combinación con contraste medido para `texto-terciario`) el par
       * terciario/arena-borde-suave da ~4.21:1, por debajo del piso AA
       * (4.5:1) para texto de 11px. `texto-secundario` sobre el mismo fondo
       * da ~5.58:1 y sí pasa.
       */}
      <span className="absolute right-lg top-lg rounded-sm bg-arena-borde-suave px-sm py-xs font-cuerpo text-chip uppercase text-texto-secundario">
        Próximamente
      </span>
      {contenido}
    </div>
  );
}
