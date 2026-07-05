const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testando conexão...');
  const result = await prisma.$queryRaw`SELECT 1+1 as resultado`;
  console.log('✅ Conectado! Resultado:', result);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());