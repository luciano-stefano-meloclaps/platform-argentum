import { expect, test } from "vitest";

import { evaluarDestino } from "./guarda-de-destino.mts";

const SIN_POOLER = "ep-red-dream-awkus0dj.c-12.us-east-1.aws.neon.tech";
const CON_POOLER = "ep-red-dream-awkus0dj-pooler.c-12.us-east-1.aws.neon.tech";
const URL_PRODUCCION = `postgresql://usuario:clave-secreta@${CON_POOLER}/base?sslmode=require`;

test("los destinos locales pasan sin confirmación", () => {
  for (const [url, host] of [
    ["postgresql://usuario:clave-secreta@localhost:5432/base", "localhost"],
    ["postgresql://usuario:clave-secreta@LOCALHOST:5432/base", "localhost"],
    ["postgresql://usuario:clave-secreta@127.0.0.1:5432/base", "127.0.0.1"],
    ["postgresql://usuario:clave-secreta@[::1]:5432/base", "[::1]"],
  ] as const) {
    expect(evaluarDestino(url, undefined)).toEqual({ permitido: true, host });
  }
});

test("un host remoto sin confirmación falla y el motivo indica cómo confirmar", () => {
  const resultado = evaluarDestino(URL_PRODUCCION, undefined);

  expect(resultado.permitido).toBe(false);
  expect(resultado.permitido ? "" : resultado.motivo).toContain(`DB_CONFIRMAR_DESTINO=${SIN_POOLER}`);
});

test("un host remoto con confirmación exacta pasa, sin distinguir mayúsculas", () => {
  expect(evaluarDestino(URL_PRODUCCION, SIN_POOLER)).toEqual({ permitido: true, host: SIN_POOLER });
  expect(evaluarDestino(URL_PRODUCCION, SIN_POOLER.toUpperCase())).toEqual({
    permitido: true,
    host: SIN_POOLER,
  });
});

test("con o sin -pooler, en la cadena o en la confirmación, se confirma indistintamente", () => {
  const url_sin_pooler = `postgresql://usuario:clave-secreta@${SIN_POOLER}/base`;

  for (const url of [URL_PRODUCCION, url_sin_pooler]) {
    for (const confirmacion of [CON_POOLER, SIN_POOLER]) {
      expect(evaluarDestino(url, confirmacion)).toEqual({ permitido: true, host: SIN_POOLER });
    }
  }
});

test("una confirmación que no coincide exactamente falla", () => {
  for (const confirmar of ["true", "", undefined, `${SIN_POOLER}.x`, "otro.host"]) {
    expect(evaluarDestino(URL_PRODUCCION, confirmar).permitido).toBe(false);
  }
});

test("una cadena ausente, inválida o sin host falla", () => {
  expect(evaluarDestino(undefined, undefined).permitido).toBe(false);
  expect(evaluarDestino("", undefined).permitido).toBe(false);
  expect(evaluarDestino("esto no es una url", undefined).permitido).toBe(false);
  expect(evaluarDestino("postgresql://usuario:clave-secreta@/base", undefined).permitido).toBe(false);
});

test("la cadena completa, el usuario y la clave nunca aparecen en el resultado", () => {
  const casos = [
    evaluarDestino(URL_PRODUCCION, undefined),
    evaluarDestino(URL_PRODUCCION, SIN_POOLER),
    evaluarDestino("postgresql://usuario:clave-secreta@localhost:5432/base", undefined),
    evaluarDestino("postgresql://usuario:clave-secreta@", undefined),
    evaluarDestino("usuario:clave-secreta sin formato", undefined),
  ];

  for (const caso of casos) {
    const salida = JSON.stringify(caso);

    expect(salida).not.toContain("clave-secreta");
    expect(salida).not.toContain("usuario:");
    expect(salida).not.toContain("sslmode");
  }
});
