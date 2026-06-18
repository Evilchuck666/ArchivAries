INSERT INTO "role_permissions" ("id", "role", "permission", "granted")
VALUES
  (gen_random_uuid(), 'VISITOR',         'members.edit_status', false),
  (gen_random_uuid(), 'MEMBER',          'members.edit_status', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'members.edit_status', false),
  (gen_random_uuid(), 'BOARD',           'members.edit_status', false),
  (gen_random_uuid(), 'ADMIN',           'members.edit_status', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'members.edit_status', true)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
