UPDATE "role_permissions"
SET "granted" = false
WHERE
    "role" = 'CONTENT_MANAGER'
AND "permission" IN ('events.create', 'events.edit', 'events.delete');
