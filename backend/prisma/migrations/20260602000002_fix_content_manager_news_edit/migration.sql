UPDATE "role_permissions"
SET "granted" = false
WHERE "role" = 'CONTENT_MANAGER' AND "permission" = 'news.edit';
