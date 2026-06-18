import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@ariesferrus.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        member: {
          create: {
            displayName: 'Administrador',
            realName: 'Admin Aries Ferrus',
            status: 'ACTIVE',
          },
        },
      },
    });
    console.log(`Created SUPER_ADMIN: ${user.email}`);
  } else {
    console.log(`SUPER_ADMIN already exists: ${adminEmail}`);
  }

  const categories = [
    { name: 'Normas', slug: 'normas', description: 'Normativa interna de la asociación', sortOrder: 1 },
    { name: 'Combate', slug: 'combate', description: 'Reglas y guías de combate', sortOrder: 2 },
    { name: 'Seguridad', slug: 'seguridad', description: 'Protocolos y guías de seguridad', sortOrder: 3 },
    { name: 'Organización', slug: 'organizacion', description: 'Documentos de organización interna', sortOrder: 4 },
    { name: 'Nuevos miembros', slug: 'nuevos-miembros', description: 'Material de bienvenida', sortOrder: 5 },
    { name: 'Ambientación', slug: 'ambientacion', description: 'Documentos de ambientación y lore aplicado', sortOrder: 6 },
    { name: 'Logística', slug: 'logistica', description: 'Material y logística de eventos', sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.documentCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} document categories`);

  // ── Default permission matrix ──────────────────────────────────────────────
  type RoleKey = 'VISITOR' | 'MEMBER' | 'CONTENT_MANAGER' | 'BOARD' | 'ADMIN' | 'SUPER_ADMIN';

  const ALL_PERMISSIONS: string[] = [
    'events.read', 'events.rsvp', 'events.create', 'events.edit', 'events.delete',
    'calendar.read',
    'lore.read', 'lore.create', 'lore.edit', 'lore.delete', 'lore.view_restricted',
    'documents.read', 'documents.read_restricted', 'documents.create', 'documents.edit', 'documents.delete',
    'documents.manage_categories',
    'news.read', 'news.create', 'news.edit', 'news.delete',
    'members.read', 'members.read_sensitive', 'members.edit_own', 'members.edit_any', 'members.edit_notes',
    'members.edit_status', 'members.create',
    'users.manage', 'users.edit_role',
    'permissions.manage',
  ];

  const GRANTED: Record<RoleKey, string[]> = {
    VISITOR: [
      'events.read', 'calendar.read',
      'lore.read',
    ],
    MEMBER: [
      'events.read', 'events.rsvp', 'calendar.read',
      'lore.read',
      'documents.read',
      'news.read',
      'members.read', 'members.edit_own',
    ],
    CONTENT_MANAGER: [
      'events.read', 'events.rsvp', 'events.create', 'events.edit', 'calendar.read',
      'lore.read', 'lore.create', 'lore.edit', 'lore.view_restricted',
      'documents.read', 'documents.read_restricted', 'documents.create', 'documents.edit',
      'news.read', 'news.create', 'news.edit',
      'members.read', 'members.edit_own',
    ],
    BOARD: [
      'events.read', 'events.rsvp', 'events.create', 'events.edit', 'events.delete', 'calendar.read',
      'lore.read', 'lore.create', 'lore.edit', 'lore.delete',
      'documents.read', 'documents.read_restricted', 'documents.create', 'documents.edit', 'documents.delete',
      'news.read', 'news.create', 'news.edit', 'news.delete',
      'members.read', 'members.read_sensitive', 'members.edit_own', 'members.edit_notes',
    ],
    ADMIN: [
      ...ALL_PERMISSIONS.filter((p) => !['events.delete', 'lore.delete', 'documents.delete', 'news.delete', 'users.edit_role', 'lore.view_restricted'].includes(p)),
      'events.delete', 'lore.delete', 'documents.delete', 'news.delete',
    ],
    SUPER_ADMIN: [...ALL_PERMISSIONS.filter((p) => p !== 'lore.view_restricted')],
  };

  const roles: RoleKey[] = ['VISITOR', 'MEMBER', 'CONTENT_MANAGER', 'BOARD', 'ADMIN', 'SUPER_ADMIN'];
  let permCount = 0;
  for (const role of roles) {
    const granted = new Set(GRANTED[role]);
    for (const permission of ALL_PERMISSIONS) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role, permission } },
        update: { granted: granted.has(permission) },
        create: { role, permission, granted: granted.has(permission) },
      });
      permCount++;
    }
  }
  console.log(`Seeded ${permCount} role permissions`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
