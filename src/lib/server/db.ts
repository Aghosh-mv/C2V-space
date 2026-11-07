import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Fail with a message a human can act on instead of Prisma's cryptic
    // "Environment variable not found" chain deep inside a query.
    throw new Error(
      'DATABASE_URL is not set — copy .env.example to .env (or run `bun run db:push`) so the server has a database.',
    )
  }
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
