INSERT INTO "role_permissions" ("id", "role", "permission", "granted") VALUES
  (gen_random_uuid(), 'VISITOR',         'lore.view_restricted', false),
  (gen_random_uuid(), 'MEMBER',          'lore.view_restricted', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'lore.view_restricted', true),
  (gen_random_uuid(), 'BOARD',           'lore.view_restricted', false),
  (gen_random_uuid(), 'ADMIN',           'lore.view_restricted', false),
  (gen_random_uuid(), 'SUPER_ADMIN',     'lore.view_restricted', false)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
