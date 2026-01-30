import { PrismaClient } from '@prisma/client'
// import { PrismaPg } from '@prisma/adapter-pg'
// import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient()
}

// Singleton pattern pour éviter les connexions multiples en dev
let prisma: PrismaClient

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = createPrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = createPrismaClient()
    }
    prisma = global.prisma
  }
} catch {
  // En mode build ou sans DATABASE_URL, on crée un mock
  prisma = {} as PrismaClient
}

export { prisma }
export default prisma
