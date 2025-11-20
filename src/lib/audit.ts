// Audit Logging System (Immutable Logs)
// Records all gateway activities for compliance and security monitoring

import { prisma } from '@/lib/prisma'
import { AuditLog } from '@/types/audit.types'

export class AuditLogger {
  // Create immutable audit log entry
  static async log(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId: logData.userId,
          action: logData.action,
          provider: logData.provider,
          prompt: logData.prompt,
          response: logData.response,
          guardrailViolations: logData.guardrailViolations 
            ? JSON.stringify(logData.guardrailViolations) 
            : null,
          metadata: logData.metadata ? JSON.stringify(logData.metadata) : null,
          ipAddress: logData.ipAddress,
          userAgent: logData.userAgent,
        },
      })

      return {
        id: log.id,
        timestamp: log.createdAt,
        userId: log.userId,
        action: log.action as 'query' | 'response' | 'guardrail_block' | 'error',
        provider: log.provider || undefined,
        prompt: log.prompt,
        response: log.response || undefined,
        guardrailViolations: log.guardrailViolations 
          ? JSON.parse(log.guardrailViolations) 
          : undefined,
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
      }
    } catch (error) {
      console.error('Failed to create audit log:', error)
      throw error
    }
  }

  // Query audit logs with filters
  static async queryLogs(filters: {
    userId?: string
    action?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }) {
    const where: any = {}

    if (filters.userId) where.userId = filters.userId
    if (filters.action) where.action = filters.action
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    })
  }

  // Get audit statistics
  static async getStatistics(userId?: string) {
    const where = userId ? { userId } : {}

    const [total, byAction, recentViolations] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      prisma.auditLog.findMany({
        where: {
          ...where,
          action: 'guardrail_block',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    return {
      totalLogs: total,
      byAction,
      recentViolations,
    }
  }
}
