import { expect, test } from "vitest";
import * as z from "zod";

import {
  esTipoConocido,
  registroDeDescriptores,
  validarDatos,
  type EntradaDe,
} from "./registro";

/**
 * Una ficha correcta. Tipada con `EntradaDe<"procer">`, que es lo mismo que va
 * a tipar un archivo de `contenido/procer/` (ADR 0009): si el descriptor cambia
 * y esta ficha deja de cumplir, el error aparece en el compilador antes que en
 * la prueba.
 */
const belgrano: EntradaDe<"procer"> = {
  nombreCompleto: "Manuel José Joaquín del Corazón de Jesús Belgrano",
  anioDeNacimiento: 1770,
  anioDeMuerte: 1820,
  resumen: "Abogado, economista y militar. Creó la bandera argentina en 1812.",
  semblanza:
    "Nació en Buenos Aires y estudió derecho en España. De vuelta en el Río " +
    "de la Plata impulsó la educación pública y el comercio, y terminó al " +
    "frente del Ejército del Norte.",
  imagen: {
    textoAlternativo: "Retrato de Manuel Belgrano de joven, con uniforme oscuro.",
    credito: "Retrato de François-Casimir Carbonnier, 1815. Museo Histórico Nacional.",
    licencia: "dominio-publico",
  },
};

/** Devuelve el `ZodError` que lanzó `accion`, o falla la prueba si no lanzó. */
function errorAlValidar(accion: () => unknown): z.ZodError {
  try {
    accion();
  } catch (error) {
    expect(error).toBeInstanceOf(z.ZodError);
    return error as z.ZodError;
  }

  throw new Error("Se esperaba que la validación fallara y no falló.");
}

/** Los campos que señalan los issues de un error, como `"imagen.licencia"`. */
function camposSenalados(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.path.join("."));
}

test("el registro de descriptores es la única fuente de qué tipos existen", () => {
  expect(Object.keys(registroDeDescriptores)).toEqual(["procer"]);
  expect(esTipoConocido("procer")).toBe(true);
  expect(esTipoConocido("dinosaurio")).toBe(false);
});

test("validar una ficha correcta devuelve los datos del tipo prócer", () => {
  const datos = validarDatos("procer", belgrano);

  // Que estas dos líneas compilen es parte de lo que se está probando: si
  // `validarDatos` devolviera `unknown` o un objeto genérico, no compilarían.
  expect(datos.nombreCompleto).toBe(belgrano.nombreCompleto);
  expect(datos.imagen.licencia).toBe("dominio-publico");
});

test("una ficha sin licencia de imagen falla y el error señala el campo", () => {
  const sinLicencia = {
    ...belgrano,
    imagen: { ...belgrano.imagen, licencia: "creo que es libre" },
  };

  const error = errorAlValidar(() => validarDatos("procer", sinLicencia));

  expect(camposSenalados(error)).toContain("imagen.licencia");
});

test("una errata en el año de nacimiento falla y el error señala el campo", () => {
  const conErrata = { ...belgrano, anioDeNacimiento: 17_700 };

  const error = errorAlValidar(() => validarDatos("procer", conErrata));

  expect(camposSenalados(error)).toContain("anioDeNacimiento");
});

test("una ficha a la que le falta el texto alternativo falla y señala el campo", () => {
  const sinAlt = {
    ...belgrano,
    imagen: { credito: belgrano.imagen.credito, licencia: belgrano.imagen.licencia },
  };

  const error = errorAlValidar(() => validarDatos("procer", sinAlt));

  expect(camposSenalados(error)).toContain("imagen.textoAlternativo");
});
