UPDATE "role_permissions"
SET "granted" = false
WHERE "role" = 'VISITOR' AND "permission" LIKE 'members.%';
