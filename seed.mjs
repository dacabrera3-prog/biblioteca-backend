import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {},
    create: {
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@biblioteca.com',
      password: hash,
      rol: 'ADMINISTRADOR',
    },
  });

  console.log('Admin creado:', admin.email);

  // Usuario bibliotecario
  const hash2 = await bcrypt.hash('biblio123', 10);
  await prisma.usuario.upsert({
    where: { email: 'bibliotecario@biblioteca.com' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'bibliotecario@biblioteca.com',
      password: hash2,
      rol: 'BIBLIOTECARIO',
    },
  });

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
