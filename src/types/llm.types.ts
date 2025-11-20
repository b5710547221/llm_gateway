import { z } from 'zod'

// LLM Provider Types
export enum LLMProvider {
  PERPLEXITY = 'perplexity',
  GEMINI = 'gemini',
  CHATGPT = 'chatgpt',
}

export const llmRequestSchema = z.object({
  prompt: z.string().min(1),
  provider: z.nativeEnum(LLMProvider).optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().optional().default(1000),
  userId: z.string(),
  sessionId: z.string().optional(),
})

export const llmResponseSchema = z.object({
  provider: z.nativeEnum(LLMProvider),
  response: z.string(),
  tokensUsed: z.number(),
  latencyMs: z.number(),
  model: z.string(),
  timestamp: z.date(),
})

export type LLMRequest = z.infer<typeof llmRequestSchema>
export type LLMResponse = z.infer<typeof llmResponseSchema>
