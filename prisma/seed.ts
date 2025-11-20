import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ai-sec.com' },
    update: {},
    create: {
      email: 'admin@ai-sec.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create test user
  const userPassword = await hashPassword('user123')
  const user = await prisma.user.upsert({
    where: { email: 'user@ai-sec.com' },
    update: {},
    create: {
      email: 'user@ai-sec.com',
      name: 'Test User',
      password: userPassword,
      role: 'user',
      emailVerified: true,
    },
  })

  console.log('Created test user:', user.email)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
