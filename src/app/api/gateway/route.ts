// Main Gateway API - Integrates all components
// Handles requests from User & Integration Layer through SSO/IAM

import { NextRequest, NextResponse } from 'next/server'
import { GuardrailPolicyEngine } from '@/lib/guardrail'
import { RoutingEngine } from '@/lib/routing'
import { MockLLMService } from '@/lib/mock-llm'
import { RAGSystem } from '@/lib/rag'
import { AuditLogger } from '@/lib/audit'
import { llmRequestSchema } from '@/types/llm.types'
import { ZodError } from 'zod'

// Initialize services
const routingEngine = new RoutingEngine()
const ragSystem = new RAGSystem()

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userId = 'anonymous'
  
  try {
    // Parse request body
    const body = await request.json()
    const validatedRequest = llmRequestSchema.parse(body)
    userId = validatedRequest.userId

    // STEP 1: GUARDRAIL - Input Control & PII Sanitization (TOR 1.3)
    console.log('🛡️  GUARDRAIL: Validating input...')
    const inputValidation = GuardrailPolicyEngine.validateInput(validatedRequest.prompt)
    
    if (!inputValidation.passed) {
      // Log guardrail block
      await AuditLogger.log({
        userId,
        action: 'guardrail_block',
        prompt: validatedRequest.prompt,
        guardrailViolations: inputValidation.violations,
        metadata: {
          riskLevel: inputValidation.riskLevel,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        {
          error: 'Input validation failed',
          violations: inputValidation.violations,
          riskLevel: inputValidation.riskLevel,
        },
        { status: 400 }
      )
    }

    // Use sanitized text
    const sanitizedPrompt = inputValidation.sanitizedText || validatedRequest.prompt

    // STEP 2: RAG - Augment with relevant context (TOR 1.5)
    console.log('🧠 RAG: Augmenting prompt with knowledge base...')
    const augmentedPrompt = await ragSystem.augmentPrompt(sanitizedPrompt)

    // STEP 3: ROUTING ENGINE - Select optimal LLM provider (TOR 1.2)
    console.log('🔀 ROUTING: Selecting optimal LLM provider...')
    const selectedProvider = routingEngine.selectProvider(validatedRequest)
    console.log(`✅ Selected provider: ${selectedProvider}`)

    // STEP 4: Call LLM Provider with Enterprise/Private Endpoint (TOR 1.2.2.4)
    console.log('🤖 LLM: Calling provider...')
    const llmResponse = await MockLLMService.call(
      selectedProvider,
      augmentedPrompt,
      validatedRequest.temperature || 0.7,
      validatedRequest.maxTokens || 1000
    )

    // STEP 5: GUARDRAIL - Output Control & Data Filtering (TOR 1.3)
    console.log('🛡️  GUARDRAIL: Validating output...')
    const outputValidation = GuardrailPolicyEngine.validateOutput(llmResponse.response)
    
    if (!outputValidation.passed) {
      // Log output guardrail block
      await AuditLogger.log({
        userId,
        action: 'guardrail_block',
        provider: selectedProvider,
        prompt: sanitizedPrompt,
        response: llmResponse.response,
        guardrailViolations: outputValidation.violations,
        metadata: {
          riskLevel: outputValidation.riskLevel,
          phase: 'output',
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        {
          error: 'Output validation failed',
          violations: outputValidation.violations,
          riskLevel: outputValidation.riskLevel,
        },
        { status: 400 }
      )
    }

    // STEP 6: AUDIT LOG - Immutable logging (TOR 4.3)
    console.log('📝 AUDIT: Logging transaction...')
    await AuditLogger.log({
      userId,
      action: 'response',
      provider: selectedProvider,
      prompt: sanitizedPrompt,
      response: outputValidation.sanitizedText || llmResponse.response,
      metadata: {
        model: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: llmResponse.latencyMs,
        totalLatencyMs: Date.now() - startTime,
        inputValidation: {
          riskLevel: inputValidation.riskLevel,
        },
        outputValidation: {
          riskLevel: outputValidation.riskLevel,
        },
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        response: outputValidation.sanitizedText || llmResponse.response,
        provider: llmResponse.provider,
        model: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: Date.now() - startTime,
        guardrails: {
          inputRiskLevel: inputValidation.riskLevel,
          outputRiskLevel: outputValidation.riskLevel,
        },
      },
    })

  } catch (error) {
    console.error('❌ Gateway error:', error)

    // Log error
    try {
      await AuditLogger.log({
        userId,
        action: 'error',
        prompt: 'Error occurred',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
