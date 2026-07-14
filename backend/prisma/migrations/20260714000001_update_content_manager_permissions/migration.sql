-- Redefine CONTENT_MANAGER permissions: scope to lore management only
-- Removes: documents.create/edit/read_restricted, events.create/edit, news.create/edit
-- Adds:    lore.delete
INSERT INTO "role_permissions" ("id", "role", "permission", "granted")
VALUES
  (gen_random_uuid(), 'CONTENT_MANAGER', 'documents.create',          false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'documents.edit',            false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'documents.read_restricted', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'events.create',             false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'events.edit',               false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'lore.delete',               true),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'news.create',               false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'news.edit',                 false)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
