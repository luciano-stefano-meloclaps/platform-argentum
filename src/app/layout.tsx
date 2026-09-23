import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";

import "./globals.css";
import { Header } from "./header.tsx";

/*
 * Las dos familias de la identidad Argentum, auto-hospedadas con
 * `next/font/google` por la corrección 5 del ADR 0008: sin esto, el
 * `@import` a Google Fonts haría una petición a un tercero desde el
 * navegador del chico y produciría salto de layout.
 *
 * Cada una expone su variable CSS, que el bloque `@theme` de `globals.css`
 * referencia como `--font-titulo` y `--font-cuerpo`. Los pesos pedidos son
 * los que la escala tipográfica realmente usa: 400, 600 y 700 para
 * Cormorant Garamond (400 para logotipo/H1–H3 grandes/cifras destacadas
 * por el ADR 0015 — `.au`, `.shiny` y el `<h1>` del hero en `font-normal`
 * no llevan ninguna otra clase de peso, así que dependen de que el 400 esté
 * realmente cargado como variante propia; sin él, el navegador sustituía
 * por el 600 más cercano o generaba negrita sintética, que es el bug que
 * corrige este cambio—, 600 para h3, 700 para display/h1/h2, este último ya
 * corregido a 700 por el ADR 0008), 400/500/600 para Lora (cuerpo, label,
 * botón, meta). No se pide la itálica: la escala tipográfica no la usa en
 * ningún componente.
 *
 * Lora reemplaza a Montserrat en toda la interfaz (ADR 0015, giro
 * museístico v2 — sistema-de-diseno-v2.md §4): no solo el cuerpo de
 * lectura largo de una ficha, sino también labels, botones, chips, nav,
 * metadatos y cifras de dashboard. Lora trae 400/500/600/700 como pesos
 * estáticos nativos (verificado contra el `font-data.json` que empaqueta
 * `next/font/google`), así que estos tres pesos no producen negrita
 * sintética — mismo criterio que ya se aplicó a Cormorant Garamond en el
 * ADR 0008. El riesgo que el ADR 0015 deja documentado y sin resolver por
 * adelantado es de legibilidad a tamaño chico y de `tabular-nums`, no de
 * disponibilidad de peso.
 */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Argentum",
  description: "Argentum",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${lora.variable}`}>
      {/*
       * Fondo y tipografía por defecto del documento: `bg-crema` (nunca
       * blanco puro, sistema de diseño §3) y `font-cuerpo` (Lora, ADR 0015).
       * Es la aplicación mínima que hace falta para que los tokens de la
       * marca dejen de ser solo declaración y pasen a estar en uso; no
       * agrega ninguna pantalla ni componente.
       */}
      <body className="flex min-h-dvh flex-col bg-crema font-cuerpo text-texto-cuerpo">
        {/*
         * Header sitewide (expansión de alcance de esta conversación, ver
         * `header.tsx`): aparece en toda pantalla, no solo en la home, por
         * eso vive acá y no en `page.tsx`.
         *
         * `min-h-dvh flex flex-col` acá, en el `<body>`, y no en el `<Hero>`:
         * el conjunto Header + Hero tiene que ocupar exactamente el
         * viewport completo, con el Header en su alto natural arriba y la
         * caja celeste del Hero (ver `hero.tsx`) rellenando el resto hasta
         * el borde inferior. Ponerle `min-h-dvh` al Hero por separado (como
         * se hizo antes) suma su propio 100dvh al alto del Header y el
         * conjunto termina pasándose de la ventana. El Header no lleva
         * `flex-1` ni `min-h`: se queda en su alto natural, y es el Hero
         * (que sí tiene `flex-1`) el que absorbe el espacio sobrante. Si
         * `page.tsx` agrega más secciones después del Hero (como
         * `SalasDelCatalogo`), quedan fuera de este cálculo: el `flex-1`
         * vive en el propio `<Hero>`, no en `<main>` ni en `{children}`,
         * así que esas secciones siguen apareciendo debajo con scroll
         * normal, sin que este layout les robe espacio.
         */}
        <Header />
        {children}
      </body>
    </html>
  );
}
