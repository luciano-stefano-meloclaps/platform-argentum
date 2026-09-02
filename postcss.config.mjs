/**
 * Tailwind v4 se conecta al build como plugin de PostCSS: es lo único que
 * necesita. No hay `tailwind.config.js` — en v4 la configuración del tema vive
 * en CSS, dentro de `@theme` (ver `src/app/globals.css`).
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
