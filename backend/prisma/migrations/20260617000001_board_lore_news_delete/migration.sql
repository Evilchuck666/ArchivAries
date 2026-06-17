UPDATE "role_permissions"
SET "granted" = true
WHERE "role" = 'BOARD'
  AND "permission" IN ('lore.delete', 'news.delete');
