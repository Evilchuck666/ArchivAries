UPDATE "role_permissions"
SET "granted" = true
WHERE "role" = 'BOARD'
  AND "permission" = 'documents.delete';
