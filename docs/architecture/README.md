# Arquitectura

Documentación de diseño y análisis funcional de **platform-argentum**.

## Contenido

| Ruta    | Qué contiene                                                        |
| ------- | ------------------------------------------------------------------- |
| `adr/`  | Architecture Decision Records: decisiones tomadas, con su contexto.  |
| (raíz)  | Análisis funcional, modelo de dominio, definiciones de alcance.      |

Esta carpeta es la única en la que escribe el agente `super-architect`.

## Sobre los ADR

Un ADR registra **una** decisión arquitectónica importante junto con el porqué:
el contexto en el que se tomó, las alternativas que se consideraron y las
consecuencias que se aceptaron. Su valor real aparece meses después, cuando
alguien —incluido tu yo futuro— se pregunta por qué las cosas están así.

Se escribe un ADR cuando la decisión es **cara de revertir**, condiciona otras
decisiones, afecta el modelo de datos o de despliegue, introduce una dependencia
estructural, toca seguridad o autorización, o define un límite entre componentes.

No escribas un ADR para decisiones triviales o reversibles con bajo costo: el
ruido le quita valor a los que sí importan.

### Cómo se usan

1. Copiá `adr/0000-template.md` a `adr/NNNN-titulo-en-kebab-case.md`, con el
   siguiente número libre.
2. Completalo **cuando la decisión se aprueba**, no cuando se propone.
3. Un ADR aprobado no se edita para cambiar la decisión. Si la decisión cambia,
   se escribe uno nuevo que la supersede y se marca el anterior como
   `Superseded by NNNN`.

### Estados

`Propuesto` · `Aceptado` · `Rechazado` · `Superseded by NNNN`

## Índice de decisiones

<!-- Agregar una línea por ADR aceptado. -->

| ADR | Decisión | Estado |
| --- | -------- | ------ |
| [0001](adr/0001-modelo-de-entidad-unica-con-jsonb.md) | Modelo de entidad única con JSONB y descriptores en código | Aceptado |
| [0002](adr/0002-monolito-modular-un-solo-deploy.md) | Aplicación fullstack modular, un solo deploy | Aceptado |
| [0003](adr/0003-stack-nextjs-postgresql.md) | Stack: Next.js 16, React 19, TypeScript y PostgreSQL | Aceptado |
| [0004](adr/0004-contenido-en-archivos-versionados.md) | Contenido curado en archivos versionados, importado a la base | Aceptado |
| [0005](adr/0005-acceso-a-datos-drizzle.md) | Acceso a datos con Drizzle ORM | Aceptado |
| [0006](adr/0006-infraestructura-vercel-neon.md) | Infraestructura: Vercel y Neon, con PostgreSQL local en Docker | Aceptado |
