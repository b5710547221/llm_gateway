import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/schemas/user.schema'
import { ZodError } from 'zod'

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch users', error: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate with Zod
    const validatedData = createUserSchema.parse(body)
    
    // Create user in database
    const user = await prisma.user.create({
      data: validatedData,
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to create user', error: String(error) },
      { status: 500 }
    )
  }
}
