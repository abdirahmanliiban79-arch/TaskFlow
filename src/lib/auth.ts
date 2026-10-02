import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'

const isProduction = process.env.NODE_ENV === 'production'

const devTrustedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:*',
]

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: isProduction ? [] : devTrustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
})