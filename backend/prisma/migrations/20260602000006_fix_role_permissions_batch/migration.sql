-- MEMBER: revocar acceso a documentos restringidos
UPDATE "role_permissions"
SET "granted" = false
WHERE "role" = 'MEMBER'
  AND "permission" = 'documents.read_restricted';

-- CONTENT_MANAGER: permitir eliminar entradas de lore
UPDATE "role_permissions"
SET "granted" = true
WHERE "role" = 'CONTENT_MANAGER'
  AND "permission" = 'lore.delete';

-- CONTENT_MANAGER: revocar creación de avisos
UPDATE "role_permissions"
SET "granted" = false
WHERE "role" = 'CONTENT_MANAGER'
  AND "permission" = 'news.create';
