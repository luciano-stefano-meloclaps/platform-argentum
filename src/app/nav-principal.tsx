"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { authClient } from "./auth-cliente.ts";
import { debeRefrescarSesion } from "./nav-refresco.ts";

/**
 * Los ítems estáticos de la Nav/TabsBar (más el dinámico Ingresar/Salir) de tipografía pura (ticket #82), en el
 * orden exacto que pide el ticket. Hoy hay pantalla real para "Explorar"
 * (`/`, `src/app/page.tsx`), "Ficha" (`/ficha`, `src/app/ficha/page.tsx`) e
 * "Índice" (`/catalogo`, `src/app/catalogo/page.tsx`) — el resto
 * ("Mi progreso", "Propuestas", "Proponer", "Perfil", "Usuarios",
 * "Ingresar") no tiene ruta ni pantalla todavía: sin `href`, se
 * renderizan como `<button type="button">` inertes, nunca como `<a>`/`<Link>`
 * que resolvería en 404 — mismo criterio que ya documentaba el
 * `NavPrincipal` viejo. "Tarjetas" pasó a tener ruta real en el ticket #91
 * (`/tarjetas`, `src/app/tarjetas/page.tsx`), "Quiz" en el ticket #94
 * (`/quiz`, `src/app/quiz/page.tsx`) y "Resultado" en el #107
 * (`/quiz/resultado`, creada por el #106); las tres se renderizan como link,
 * igual que "Explorar", "Ficha" e "Índice".
 *
 * "Ingresar" salió de esta lista estática en el ticket #114: ya no es un
 * botón inerte, es el ítem dinámico que se arma más abajo a partir de
 * `sesionActiva` — "Ingresar" (link a `/ingresar`) o "Salir" (Server Action
 * que cierra la sesión), la señal visible de en cuál de los dos estados está
 * el visitante. Se renderiza en la misma posición, al final.
 */
const ITEMS = [
  { etiqueta: "Explorar", href: "/" },
  { etiqueta: "Ficha", href: "/ficha" },
  { etiqueta: "Tarjetas", href: "/tarjetas" },
  { etiqueta: "Quiz", href: "/quiz" },
  { etiqueta: "Mi progreso" },
  { etiqueta: "Propuestas" },
  { etiqueta: "Índice", href: "/catalogo" },
  { etiqueta: "Proponer" },
  { etiqueta: "Resultado", href: "/quiz/resultado" },
  { etiqueta: "Perfil" },
  { etiqueta: "Usuarios" },
] as const;

/**
 * Devuelve si `href` es la sección activa para `pathname`. "/" solo se
 * considera activo con match exacto (si no, marcaría cualquier ruta como
 * "Explorar" activo); el resto, exacto o como prefijo de una ruta hija —
 * `/catalogo/manuel-belgrano` también marca "Índice" como activo.
 */
function esActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Clases compartidas por todo ítem, sea link real o botón inerte —
 * tipografía pura del ticket #82, sin pill ni fondo detrás del activo, sin
 * ícono, sin badge, sin sombra. `font-cuerpo` es Lora (`--font-body` del
 * ticket): el nav es UI, nunca `font-titulo` (Cormorant Garamond, reservada
 * a titulación). `text-[10px]` y `tracking-[0.14em]` no tienen token en la
 * escala existente — mismo criterio documentado en `header.tsx` para los
 * `text-[56px]`/`tracking-[0.34em]` del logotipo: valor puntual de este
 * componente, no una escala nueva.
 *
 * `border-b border-b-transparent`: el preflight de Tailwind ya deja
 * `border-width: 0` en los cuatro lados, así que alcanza con fijar el ancho
 * del lado inferior a 1px transparente — reserva el espacio de la línea
 * activa para que no salte el layout al cambiar de ítem, sin pisar ningún
 * otro lado.
 *
 * `transition-[color]` (no `transition-colors`, que además anima
 * `border-color`, `background-color`, etc.): el ticket pide una única
 * transición, `color 120ms ease`.
 */
const clasesBase =
  "cursor-pointer border-b border-b-transparent bg-transparent px-md py-sm font-cuerpo text-[10px] uppercase leading-none tracking-[0.14em] whitespace-nowrap text-texto-cuerpo transition-[color] duration-[120ms] ease-[ease] hover:text-celeste-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-text";

/**
 * Vía `aria-current="page"` únicamente — nunca una clase `.active`
 * desconectada del estado semántico. El espacio entre texto y línea lo da
 * el `py-sm` (8px) de `clasesBase`; acá no se agrega margin extra. El
 * `font-weight` no cambia: la diferencia activo/inactivo es solo color +
 * línea.
 */
const clasesActivo = "border-b-celeste-text text-celeste-text";

/** "Salir" con estado de envío: se deshabilita mientras la acción corre, para no dispararla dos veces. `useFormStatus` exige ser hijo del `<form>`. */
function BotonSalir() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${clasesBase} disabled:cursor-wait disabled:opacity-60`}>
      Salir
    </button>
  );
}

type Props = {
  /** Server Action que cierra la sesión (`./header.acciones.ts`), pasada como prop por el mismo motivo que cualquier Server Action se pasa de un Server Component a un Client Component. */
  cerrarSesion: () => Promise<void>;
};

/**
 * Nav/TabsBar de tipografía pura (ticket #82), reemplazo del `NavPrincipal`
 * con subrayado grueso y fondo `rounded-sm`. Nav simple, no widget ARIA
 * tabs: `aria-current="page"`, nunca `aria-selected` ni `role="tablist"`.
 * Único fragmento de cliente del bloque superior del header: `usePathname`
 * no existe en un Server Component, y es lo único que este componente
 * necesita para resaltar el ítem activo.
 *
 * Contenedor: ancho completo del header (sin `max-width` propio, se centra
 * por `justify-content`), `flex-wrap` deja 2-3 líneas en mobile —nunca
 * hamburguesa ni scroll horizontal— cada una centrada.
 *
 * El último ítem (tickets #114 y #120, ADR 0020) es dinámico y su estado sale
 * de `authClient.useSession()`, en el navegador: el `Header` es estático y no
 * lee la sesión en el servidor. Dos estados, siempre con el mismo ancho
 * (una grilla de una celda, con la visible como flex item para tener la misma caja que el resto de la nav donde se apilan las dos etiquetas y la que no se
 * ve queda `invisible`, así el ancho es el de la más larga y nada se corre
 * al llegar la respuesta):
 *
 * - Cargando o sin sesión: `<Link>` a `/ingresar`. Nunca "Salir" antes de
 *   confirmar la sesión (ADR 0020, Regla 3); y como "Ingresar" es un link
 *   real, sirve también sin JavaScript.
 * - Con sesión confirmada: `<form>` de un solo botón "Salir".
 *
 * Refresco (ADR 0020, Regla 5). Las señales de `useSession()` solo se
 * disparan con llamadas hechas desde el cliente de Better Auth
 * (`atomListeners`, `$sessionSignal`), y el login/logout acá son Server
 * Actions, así que el estado quedaría viejo. Se llama a `refetch()`
 * (documentación de Better Auth, "Manually refetch session"):
 * - tras el logout, dentro de la propia acción del formulario, antes de
 *   navegar a la home;
 * - tras el login por email o el registro, solo cuando la ruta anterior era
 *   una de `RUTAS_DE_ENTRADA` (`/ingresar`, `/registrarse`; la acción redirige
 *   a `/`). Navegar entre otras rutas no pide nada: la sesión se lee una vez
 *   por carga, más el refresco por foco de ventana que Better Auth trae por
 *   defecto. Google no necesita nada (redirección completa, recarga la
 *   página). La decisión vive en `nav-refresco.ts`.
 *
 * Solo es una señal de interfaz: autorizar sigue siendo del módulo, con
 * `obtenerSesion()` (ADR 0020, Regla 4).
 */
export function NavPrincipal({ cerrarSesion }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending, refetch } = authClient.useSession();
  const sesionActiva = !isPending && data !== null && data !== undefined;

  const pathnameAnterior = useRef(pathname);
  useEffect(() => {
    const anterior = pathnameAnterior.current;
    if (anterior === pathname) return;
    pathnameAnterior.current = pathname;
    if (debeRefrescarSesion(anterior, pathname)) void refetch();
  }, [pathname, refetch]);

  async function salir() {
    try {
      await cerrarSesion();
    } finally {
      // Aunque la acción falle, la nav vuelve a preguntar cuál es el estado real.
      await refetch();
    }
    router.push("/");
  }

  return (
    <nav aria-label="Principal" className="flex flex-wrap items-center justify-center gap-x-xs gap-y-0 pt-[6px]">
      {ITEMS.map((item) => {
        if (!("href" in item)) {
          return (
            <button key={item.etiqueta} type="button" className={clasesBase}>
              {item.etiqueta}
            </button>
          );
        }

        const activo = esActivo(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={activo ? `${clasesBase} ${clasesActivo}` : clasesBase}
          >
            {item.etiqueta}
          </Link>
        );
      })}

      <div className="inline-grid">
        <div className="col-start-1 row-start-1 flex">
          {sesionActiva ? (
            <form action={salir}>
              <BotonSalir />
            </form>
          ) : (
            <Link
              href="/ingresar"
              aria-current={esActivo(pathname, "/ingresar") ? "page" : undefined}
              className={esActivo(pathname, "/ingresar") ? `${clasesBase} ${clasesActivo}` : clasesBase}
            >
              Ingresar
            </Link>
          )}
        </div>
        {/* Reserva de ancho: la etiqueta que no se muestra, invisible y fuera del árbol de accesibilidad. */}
        <span aria-hidden="true" className={`col-start-1 row-start-1 invisible ${clasesBase}`}>
          {sesionActiva ? "Ingresar" : "Salir"}
        </span>
      </div>
    </nav>
  );
}
