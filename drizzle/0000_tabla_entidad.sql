CREATE TABLE "entidad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"datos" jsonb NOT NULL,
	CONSTRAINT "entidad_slug_unico" UNIQUE("slug")
);
