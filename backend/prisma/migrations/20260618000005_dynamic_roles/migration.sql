-- CreateTable: role_definitions
CREATE TABLE "role_definitions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "isProtected" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "role_definitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_definitions_name_key" ON "role_definitions"("name");

-- Seed initial roles
INSERT INTO "role_definitions" ("id", "name", "label", "level", "isProtected") VALUES
  (gen_random_uuid(), 'VISITOR',         'Visitante',            0,  true),
  (gen_random_uuid(), 'MEMBER',          'Miembro',              10, true),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'Gestor de contenido',  20, false),
  (gen_random_uuid(), 'BOARD',           'Junta directiva',      30, false),
  (gen_random_uuid(), 'ADMIN',           'Administrador',        40, false),
  (gen_random_uuid(), 'SUPER_ADMIN',     'Super Admin',          50, true);

-- Convert users.role from enum Role to TEXT
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- Convert role_permissions.role from enum Role to TEXT
ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;

-- Drop the PostgreSQL enum type
DROP TYPE "Role";

-- Add roles.manage permission (only SUPER_ADMIN gets it)
INSERT INTO "role_permissions" ("id", "role", "permission", "granted") VALUES
  (gen_random_uuid(), 'VISITOR',         'roles.manage', false),
  (gen_random_uuid(), 'MEMBER',          'roles.manage', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'roles.manage', false),
  (gen_random_uuid(), 'BOARD',           'roles.manage', false),
  (gen_random_uuid(), 'ADMIN',           'roles.manage', false),
  (gen_random_uuid(), 'SUPER_ADMIN',     'roles.manage', true)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
