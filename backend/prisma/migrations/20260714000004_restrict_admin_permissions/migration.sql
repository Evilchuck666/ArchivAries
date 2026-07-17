-- permissions.manage y roles.manage pasan a ser exclusivos de SUPER_ADMIN
UPDATE "role_permissions"
SET "granted" = false
WHERE "role" = 'ADMIN'
  AND "permission" IN ('permissions.manage', 'roles.manage');
