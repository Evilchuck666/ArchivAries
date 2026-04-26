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

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
