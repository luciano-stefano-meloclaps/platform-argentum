import { GrillaSalas } from "./grilla-salas.tsx";
import { contarEntidadesPorTipo, type SalaTipo } from "./salas-del-catalogo.datos.ts";

/**
 * Una de las seis salas del catálogo: su numeral romano de orden, su tipo
 * (para pedirle la cantidad real a `contarEntidadesPorTipo`) y su nombre.
 * Ninguna lleva `href`: a
 * diferencia de la versión anterior de este componente (ticket #71), esta
 * grilla no distingue salas con o sin ruta propia — esa decisión la toma
 * `GrillaSalas` (`grilla-salas.tsx`) al momento del click, no el marcado.
 */
type Sala = {
  numero: string;
  tipo: SalaTipo;
  nombre: string;
};

const SALAS: Sala[] = [
  { numero: "I", tipo: "procer", nombre: "Próceres" },
  { numero: "II", tipo: "monumento", nombre: "Monumentos" },
  { numero: "III", tipo: "naturaleza", nombre: "Naturaleza" },
  { numero: "IV", tipo: "comida", nombre: "Comidas" },
  { numero: "V", tipo: "fecha-patria", nombre: "Fechas patrias" },
  { numero: "VI", tipo: "animal", nombre: "Animales" },
];

/**
 * "Las salas del catálogo": el índice completo de las seis categorías fijas
 * del catálogo, cada una con su cantidad de entidades — no una vidriera de
 * contenido individual (eso es "Láminas destacadas", todavía sin construir),
 * sino la tabla de contenidos clickeable de todo el catálogo. Vive en la
 * pantalla Explorar (`page.tsx`, la home), después del hero y antes de
 * "Láminas destacadas".
 *
 * Server Component: solo pide los conteos y arma los datos — la interactividad
 * (el `onClick` de cada celda) vive en `GrillaSalas`, la única isla de
 * cliente de esta sección.
 *
 * Las seis cantidades se piden en paralelo con `Promise.all` (no una detrás
 * de otra) para no armar una cascada de espera.
 */
export async function SalasDelCatalogo() {
  const salas = await Promise.all(
    SALAS.map(async (sala) => ({ ...sala, cantidad: await contarEntidadesPorTipo(sala.tipo) })),
  );

  return (
    <section className="mx-auto max-w-5xl px-lg pb-2xl">
      {/*
       * Encabezado de sección: kicker centrado, sin subtítulo y sin CTA "ver
       * todas" — a diferencia de "Láminas destacadas", que si tiene esa
       * llamada, acá no aplica porque las seis salas SON todo el índice.
       * El tamaño/peso/tracking del kicker usa el token `--text-kicker`
       * (`globals.css`, 15px/600/0.2em) — mismo bloque que el kicker de
       * "Láminas destacadas" (`laminas-destacadas.tsx`), formalizado por el
       * `brand-specialist` en el ticket #88 al detectar la repetición
       * literal. `64px`/`26px` de margen: métrica exacta pedida por el
       * usuario, sin token equivalente en la escala de espaciado
       * (4/8/12/16/22/32) — queda como excepción revisada (`brand-specialist`,
       * ticket #88), mismo criterio que ya aplican `hero.tsx` y
       * `estadisticas-catalogo.tsx`.
       */}
      <div className="mt-[64px] mb-[26px] text-center">
        <h2 className="m-0 font-titulo text-kicker text-texto-titulo uppercase">
          Las salas del catálogo
        </h2>
      </div>

      <GrillaSalas salas={salas} />
    </section>
  );
}
