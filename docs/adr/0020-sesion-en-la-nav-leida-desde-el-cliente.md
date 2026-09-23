# 0020 — La sesión de la barra de navegación se lee desde el cliente, para no volver dinámico el catálogo

- **Estado:** Aceptado (supersede parcialmente al 0019, solo su Regla 4)
- **Fecha:** 2026-09-23
- **Decide:** el usuario; **redacta:** el `super-architect`

## Decisión

El `Header` del layout raíz **deja de llamar a `obtenerSesion()`** y vuelve a
ser un Server Component estático. La señal de sesión («Ingresar» / «Salir»)
la resuelve la isla de cliente `NavPrincipal`, que pide la sesión al
navegador con `authClient.useSession()` de `better-auth/react`, contra el
endpoint que el ADR 0019 (Regla 3) ya montó en `/api/auth/[...all]`.

`obtenerSesion()` **sigue existiendo** en `identidad.ts` para lo que sí
corre en el servidor y necesita la sesión de verdad: autorizar dentro de un
módulo, Server Actions y, más adelante, rutas que exijan cuenta (`progreso`).
Lo que se saca es su uso en el layout.

Sin `cacheComponents`, sin route groups, sin Suspense/PPR: **el ADR 0016 no
se toca** y queda reforzado.

## Contexto

El ticket #114 (PR #117) agregó al `Header` una señal visible de sesión. Para
eso el `Header` es `async` y llama a `obtenerSesion()`, que usa `headers()` de
`next/headers`. Esa llamada, hecha en el layout raíz, marca **todas** las
rutas como dinámicas, incluida `/catalogo/[slug]`, que el ADR 0016 (Regla 5)
manda prerenderizar en el build con `dynamicParams = false`, de modo que la
aplicación no consulte PostgreSQL en runtime. Hoy ninguna ruta exige sesión:
fuera de `/ingresar` y `/registrarse`, la sesión solo se lee en el `Header`.
Producción ya muestra el catálogo vacío, y no conviene sumarle una función
serverless por visita.

## Problema

Mostrar el estado de sesión en la barra sin obligar a que el catálogo público
se renderice por pedido, y sin contradecir el 0016.

## Alternativas consideradas

### A. Sesión desde un componente de cliente, tras la hidratación
El `Header` es estático; `NavPrincipal` llama a `useSession()`, que consulta
`/api/auth/get-session`. El HTML prerenderizado trae un estado inicial
neutro y la isla lo corrige al hidratar.

### B. Route groups con layouts separados
`(publico)` estático y `(cuenta)` dinámico, cada uno con su `Header`. En el
grupo público el `Header` no puede conocer la sesión: o se pierde la señal
donde más se navega, o se vuelve a A dentro del grupo. Además duplica el
layout y mueve rutas para resolver algo que no es de rutas.

### C. Suspense / PPR
Requiere `cacheComponents`, que el 0016 excluye. Sin él, un `Suspense`
alrededor de un componente que usa `headers()` **no** evita que la ruta sea
dinámica. Es la opción que más contradice un ADR vigente.

### D. No hacer nada
Toda la app dinámica: la ficha se renderiza por pedido y vuelve a consultar
la base en runtime. Contradice el 0016 y empeora el problema de producción.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | Un solo archivo cambia de lado; el catálogo queda estático; usa el endpoint y el paquete que ya están | Parpadeo del estado inicial; una petición por carga; matiza la Regla 4 del 0019 | Bajo: se vuelve a `obtenerSesion()` en el `Header` |
| B | Server-side puro donde hace falta | Pierde la señal en el catálogo o replica A; duplica layouts | Medio |
| C | Sin parpadeo | Contradice el 0016; activa `cacheComponents` para toda la app | Alto |
| D | Cero cambios | Contradice el 0016; costo en runtime | — |

## Decisión elegida

### Regla 1 — El layout no lee la sesión en el servidor
Ningún componente del layout raíz ni de una ruta pública prerenderizada llama
a `obtenerSesion()`, `headers()` ni `cookies()`. Si una ruta necesita la
sesión en el servidor, es una ruta dinámica por elección propia y no lo
arrastra al resto.

### Regla 2 — La sesión de la nav se pide desde el cliente
`NavPrincipal` usa `authClient.useSession()`. El cliente de Better Auth se
crea en un solo módulo de cliente compartido con el botón de Google, en vez
de un `createAuthClient()` por archivo.

### Regla 3 — Estado inicial neutro, sin promesas falsas
Mientras la sesión carga, la nav muestra «Ingresar» —el estado de quien no
tiene sesión— o un espacio reservado del mismo ancho, para no mover el
layout. **Nunca** muestra «Salir» hasta confirmar la sesión. La elección
concreta es del `frontend-specialist`.

### Regla 4 — Enmienda a la Regla 4 del 0019
La excepción de «lo que se resuelve con una llamada de servidor pasa por
`identidad.ts`» se amplía: además del botón de Google, **la lectura de la
sesión para mostrar el estado en la nav** puede hacerse con el cliente de
Better Auth. Para autorizar nada cambia: la autorización se verifica dentro
del módulo, con `obtenerSesion()`, nunca según lo que el cliente crea tener
(ADR 0002).

### Regla 5 — La nav se mantiene coherente tras entrar y salir
El layout persiste entre navegaciones del cliente, así que el estado de
`useSession()` puede quedar viejo tras un login o un logout hechos con Server
Actions. Se conservan las Server Actions (0019, Regla 5) y la nav debe
refrescar la sesión al terminar cada una. Cómo se refresca (refetch,
recarga completa de la ruta) lo verifica el implementador contra la
documentación de Better Auth: **no verificado** en este ADR.

## Motivo

La opción más pequeña que respeta el 0016: cambia un componente de lado y usa
lo que el 0019 ya instaló. El costo es visual y acotado (un parpadeo en un
enlace); el costo de las otras es estructural y persistente.

## Consecuencias

- El catálogo y la ficha vuelven a prerenderizarse, sin llamada a la base en
  runtime.
- El endpoint `/api/auth/[...all]` recibe una lectura por carga de página de
  cada visitante (sin cookie, responde sin tocar la base). A esa lectura se
  suman una tras el login o el registro y una tras el logout (las Server
  Actions no disparan las señales del cliente de Better Auth, así que la nav
  refresca a mano, ticket #120) y las del `refetchOnWindowFocus` que Better
  Auth trae por defecto. No es el `/api`
  interno que prohíbe el 0016: es infraestructura del protocolo (0019, Regla
  3).
- La señal de sesión ya no está en el HTML inicial: no sirve para SEO ni sin
  JavaScript, y no debe ser lo único que impida una acción.
- Criterio de verificación: `next build` debe mostrar `/catalogo/[slug]` como
  estática (`●`/`○`, no `ƒ`).
- **Revisar si:** aparece una ruta que exija sesión en el servidor
  (`progreso`) —esa ruta es dinámica por su cuenta, sin tocar el layout—; o el
  parpadeo resulta inaceptable, momento de reabrir `cacheComponents` con un
  ADR que supersede al 0016.
- Pendiente de verificar en el PR #117: no aparece `dynamicParams = false`
  en `src/app/catalogo/[slug]/page.tsx` según una lectura parcial; hay que
  confirmar que el 0016 se cumple hoy.
