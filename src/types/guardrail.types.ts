import { z } from 'zod'

// Guardrail Types
export const guardrailCheckSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.string()),
  sanitizedText: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
})

export const piiDetectionSchema = z.object({
  hasPII: z.boolean(),
  piiTypes: z.array(z.enum(['email', 'phone', 'ssn', 'credit_card', 'address', 'name'])),
  sanitized: z.string(),
})

export const injectionDetectionSchema = z.object({
  isInjection: z.boolean(),
  injectionType: z.enum(['sql', 'prompt', 'xss', 'command', 'none']),
  confidence: z.number().min(0).max(1),
})

export type GuardrailCheck = z.infer<typeof guardrailCheckSchema>
export type PIIDetection = z.infer<typeof piiDetectionSchema>
export type InjectionDetection = z.infer<typeof injectionDetectionSchema>
