import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get statistics
    const [totalUsers, totalAdmins, verifiedUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        recentUsers,
      },
    })
  } catch (error: any) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
