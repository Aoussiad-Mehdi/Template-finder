import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/template_finder';

// Prevent Prisma schema validation errors when DATABASE_URL is missing in local dev.
// You can still override this by setting DATABASE_URL in your environment.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
