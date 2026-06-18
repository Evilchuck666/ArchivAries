INSERT INTO "role_permissions" ("id", "role", "permission", "granted")
VALUES
  -- users.manage (ADMIN, SUPER_ADMIN)
  (gen_random_uuid(), 'VISITOR',         'users.manage', false),
  (gen_random_uuid(), 'MEMBER',          'users.manage', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'users.manage', false),
  (gen_random_uuid(), 'BOARD',           'users.manage', false),
  (gen_random_uuid(), 'ADMIN',           'users.manage', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'users.manage', true),
  -- users.edit_role (SUPER_ADMIN only)
  (gen_random_uuid(), 'VISITOR',         'users.edit_role', false),
  (gen_random_uuid(), 'MEMBER',          'users.edit_role', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'users.edit_role', false),
  (gen_random_uuid(), 'BOARD',           'users.edit_role', false),
  (gen_random_uuid(), 'ADMIN',           'users.edit_role', false),
  (gen_random_uuid(), 'SUPER_ADMIN',     'users.edit_role', true),
  -- members.create (ADMIN, SUPER_ADMIN)
  (gen_random_uuid(), 'VISITOR',         'members.create', false),
  (gen_random_uuid(), 'MEMBER',          'members.create', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'members.create', false),
  (gen_random_uuid(), 'BOARD',           'members.create', false),
  (gen_random_uuid(), 'ADMIN',           'members.create', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'members.create', true),
  -- documents.manage_categories (ADMIN, SUPER_ADMIN)
  (gen_random_uuid(), 'VISITOR',         'documents.manage_categories', false),
  (gen_random_uuid(), 'MEMBER',          'documents.manage_categories', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'documents.manage_categories', false),
  (gen_random_uuid(), 'BOARD',           'documents.manage_categories', false),
  (gen_random_uuid(), 'ADMIN',           'documents.manage_categories', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'documents.manage_categories', true),
  -- permissions.manage (ADMIN, SUPER_ADMIN)
  (gen_random_uuid(), 'VISITOR',         'permissions.manage', false),
  (gen_random_uuid(), 'MEMBER',          'permissions.manage', false),
  (gen_random_uuid(), 'CONTENT_MANAGER', 'permissions.manage', false),
  (gen_random_uuid(), 'BOARD',           'permissions.manage', false),
  (gen_random_uuid(), 'ADMIN',           'permissions.manage', true),
  (gen_random_uuid(), 'SUPER_ADMIN',     'permissions.manage', true)
ON CONFLICT ("role", "permission") DO UPDATE SET "granted" = EXCLUDED."granted";
