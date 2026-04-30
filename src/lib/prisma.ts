import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const adapter = new PrismaPg(process.env.DATABASE_URL);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Lazy proxy — defers client creation (and the DATABASE_URL guard) to first use
// so next build doesn't require DATABASE_URL to be set at build time.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());
    return Reflect.get(client, prop, client);
  },
});
