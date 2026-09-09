import type { EntradaDe, Tipo } from "../descriptores/registro";

/**
 * La forma de lo que exporta por defecto un archivo de contenido (ADR 0009: "un
 * objeto con el **nombre** de la entidad y sus **datos**").
 *
 * Es el tipo con el que se anota el archivo de contenido, y por eso vive del
 * lado de la importación y no en el registro de descriptores: el contrato del
 * archivo lo define quien lo lee. Los **datos** van con `EntradaDe` y no con
 * `DatosDe` para que un descriptor con `.default()` no obligue a tocar las
 * sesenta fichas.
 *
 * **Por qué está en su propio archivo `.ts` y no en `contenido.mts`.** Es lo
 * único de la importación que importa un archivo de `contenido/`, y lo importa
 * como `import type`, que por el ADR 0011 va **sin extensión**. Un
 * especificador sin extensión no resuelve a un `.mts`: la resolución de
 * módulos solo prueba `.mts` cuando el especificador termina en `.mjs`. Un
 * archivo `.ts` es lo que hace que la regla del ADR 0011 y la extensión `.mts`
 * de `contenido.mts` —que existe para que el comando de importación corra con
 * `node` a secas (ADR 0009)— puedan convivir sin que ninguna ceda.
 *
 * No agrega ninguna capa: es una declaración de tipo, se borra al compilar, y
 * `node` nunca lo abre.
 */
export type FichaDe<T extends Tipo> = {
  nombre: string;
  datos: EntradaDe<T>;
};
