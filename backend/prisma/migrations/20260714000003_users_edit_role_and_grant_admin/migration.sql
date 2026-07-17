-- Allow ADMIN to change user roles
UPDATE "role_permissions"
SET "granted" = true
WHERE "role" = 'ADMIN' AND "permission" = 'users.edit_role';

-- New permission: users.grant_admin (only SUPER_ADMIN can assign admin-level roles)
INSERT INTO "role_permissions" ("id", "role", "permission", "granted")
VALUES
  (gen_random_uuid(), 'VISITOR',         'users.grant_admin', false),
  (gen_random_uuid(), 'MEMBER',          'users.grant_admin', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'users.grant_admin', false),
  (gen_random_uuid(), 'BOARD',           'users.grant_admin', false),
  (gen_random_uuid(), 'ADMIN',           'users.grant_admin', false),
  (gen_random_uuid(), 'SUPER_ADMIN',     'users.grant_admin', true)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
