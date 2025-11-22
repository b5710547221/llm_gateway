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

  // Create sample posts
  const post1 = await prisma.post.upsert({
    where: { id: 'sample-post-1' },
    update: {},
    create: {
      id: 'sample-post-1',
      title: 'Welcome to AI-Sec Gateway',
      content: 'This is a secure AI gateway platform that implements NCSC security standards for GenAI applications. It includes guardrails, routing, RAG, and comprehensive audit logging.',
      published: true,
      authorId: admin.id,
    },
  })

  const post2 = await prisma.post.upsert({
    where: { id: 'sample-post-2' },
    update: {},
    create: {
      id: 'sample-post-2',
      title: 'Security Features',
      content: 'Our gateway includes PII detection, SQL injection prevention, prompt injection detection, and multi-provider load balancing for enhanced security and reliability.',
      published: true,
      authorId: admin.id,
    },
  })

  const post3 = await prisma.post.upsert({
    where: { id: 'sample-post-3' },
    update: {},
    create: {
      id: 'sample-post-3',
      title: 'Getting Started',
      content: 'Login with your credentials, select an LLM provider from the gateway interface, and start making secure AI queries with built-in threat detection and audit logging.',
      published: true,
      authorId: user.id,
    },
  })

  console.log('Created sample posts:', post1.id, post2.id, post3.id)

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
