import { PrismaClient } from './generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma: PrismaClient

declare global {
  var prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
