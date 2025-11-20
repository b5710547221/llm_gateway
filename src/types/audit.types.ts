import { z } from 'zod'

// Audit Log Schema
export const auditLogSchema = z.object({
  id: z.string().cuid(),
  timestamp: z.date(),
  userId: z.string(),
  action: z.enum(['query', 'response', 'guardrail_block', 'error']),
  provider: z.string().optional(),
  prompt: z.string(),
  response: z.string().optional(),
  guardrailViolations: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

export type AuditLog = z.infer<typeof auditLogSchema>
