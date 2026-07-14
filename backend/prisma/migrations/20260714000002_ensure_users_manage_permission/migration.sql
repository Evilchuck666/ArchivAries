-- Ensure users.manage exists for all roles with correct granted values.
-- ADMIN and SUPER_ADMIN: true. All others: false.
INSERT INTO "role_permissions" ("id", "role", "permission", "granted")
VALUES
  (gen_random_uuid(), 'VISITOR',         'users.manage', false),
  (gen_random_uuid(), 'MEMBER',          'users.manage', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'users.manage', false),
  (gen_random_uuid(), 'BOARD',           'users.manage', false),
  (gen_random_uuid(), 'ADMIN',           'users.manage', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'users.manage', true)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
