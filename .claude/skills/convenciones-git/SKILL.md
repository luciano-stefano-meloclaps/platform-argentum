---
name: convenciones-git
description: Convenciones de ramas y mensajes de commit de este proyecto. Usala siempre que vayas a crear una rama, escribir un mensaje de commit o commitear cambios.
when_to_use: Al crear una rama, al commitear, cuando el usuario pide "commiteá", "hacé un commit", "creá una rama" o pregunta cómo nombrar una rama o redactar un mensaje.
allowed-tools: Bash(git status:*) Bash(git diff:*) Bash(git log:*) Bash(git branch:*)
---

# Convenciones de Git

## Quién commitea

El trabajo con ticket lo commitea el **`delivery-specialist`**, que verifica el
árbol contra el ticket antes de escribir el mensaje. Los demás especialistas
dejan sus archivos en el árbol de trabajo y dicen qué cambiaron.

La sesión principal y el arquitecto commitean por su cuenta: documentación, ADR
y configuración están fuera del circuito de tickets a propósito.

## Antes de commitear

1. Revisá `git status` y `git diff` completos. No commitees a ciegas.
2. Verificá que no entren secretos, claves, correos ni rutas absolutas.
3. Confirmá que los cambios corresponden a **una sola intención**. Si hay dos,
   son dos commits.

Recién con esto en orden, escribí el mensaje.

## Intenciones

Toda rama y todo commit se clasifican con una de estas seis:

| Intención | Cuándo |
| --------- | ------ |
| `Feat` | Funcionalidad nueva |
| `Bugfix` | Corrección de un error |
| `Refactor` | Cambio interno sin alterar el comportamiento |
| `Test` | Pruebas |
| `Doc` | Documentación |
| `Design` | Interfaz, estilos, experiencia de uso |

## Las intenciones también titulan los issues

Un ticket y el commit que lo cierra describen el mismo trabajo, así que el título
de un issue usa **esta misma tabla**, con el mismo formato:
`[Intención] Mensaje breve`. Ver `docs/agents/issue-tracker.md`.

## Nombre de rama

```
<intención-en-minúscula>/<descripción-en-kebab-case>
```

Ejemplos: `feat/quiz-de-preguntas` · `bugfix/importacion-de-fichas` ·
`doc/adr-de-arquitectura` · `design/ficha-de-procer`

La descripción va en minúsculas, con guiones, sin tildes ni ñ, y nombra **el
alcance del trabajo**, no la tarea puntual.

## Mensaje de commit

**Título:**

```
[Intención] Mensaje breve del commit
```

- La intención va entre corchetes, con la primera letra en mayúscula, tal cual
  figura en la tabla.
- El mensaje es **muy breve** y dice qué se hizo.
- Sin punto final.

**Descripción:** dice exclusivamente dos cosas, en este orden.

1. **Listado de las cosas que cambiaron.**
2. **Razones por las que estas cosas cambiaron.**

Nada más: ni instrucciones de uso, ni planes a futuro, ni comentarios.

**Referencia al ticket:** si el commit corresponde a un ticket, cerrá el
mensaje con una última línea que lo referencie.

```
Ticket: #12
```

Es una **referencia, no un cierre**. No uses `Closes #12` ni `Fixes #12`: esas
palabras hacen que GitHub cierre el issue solo al publicar, y en este proyecto
el cierre es explícito y tiene una condición —el commit tiene que estar en el
remoto—.

## Ejemplo

```
[Feat] Importación de contenido desde archivos

Cambios:
- Script de importación que lee `content/` y escribe en la base.
- Validación de cada ficha contra el descriptor Zod de su tipo.
- Comando `pnpm content:import`.

Razones:
- El contenido curado vive en archivos versionados (ADR 0004) y hacía falta
  el paso que lo lleva a la base, que es lo que sirve la aplicación.
- Validar en la importación evita que entre contenido que no cumple el
  esquema del tipo.

Ticket: #12
```
