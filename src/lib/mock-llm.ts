// Mock LLM Provider Service
// Simulates responses from Perplexity AI, Google Gemini Pro, and OpenAI ChatGPT

import { LLMProvider, LLMResponse } from '@/types/llm.types'

export class MockLLMService {
  // Mock Perplexity AI
  static async callPerplexity(prompt: string, temperature: number, maxTokens: number): Promise<LLMResponse> {
    const startTime = Date.now()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    
    const mockResponse = `[Perplexity AI Response] Based on my search and analysis: ${prompt.slice(0, 50)}... 
    
Here's what I found from various sources:
1. Relevant information addressing your query
2. Cross-referenced data from multiple sources
3. Evidence-based insights with citations

This response leverages real-time web search capabilities to provide current and accurate information.`

    return {
      provider: LLMProvider.PERPLEXITY,
      response: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4),
      latencyMs: Date.now() - startTime,
      model: 'pplx-70b-online',
      timestamp: new Date(),
    }
  }

  // Mock Google Gemini Pro
  static async callGemini(prompt: string, temperature: number, maxTokens: number): Promise<LLMResponse> {
    const startTime = Date.now()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250))
    
    const mockResponse = `[Gemini Pro Response] Analyzing your request: ${prompt.slice(0, 50)}...

As Google's advanced AI model, I can provide:
• Comprehensive multi-modal understanding
• Deep contextual analysis
• Nuanced reasoning capabilities
• Integration with Google's knowledge base

Response: [Detailed analysis based on your query with structured insights and recommendations]`

    return {
      provider: LLMProvider.GEMINI,
      response: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4),
      latencyMs: Date.now() - startTime,
      model: 'gemini-pro',
      timestamp: new Date(),
    }
  }

  // Mock OpenAI ChatGPT
  static async callChatGPT(prompt: string, temperature: number, maxTokens: number): Promise<LLMResponse> {
    const startTime = Date.now()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 220))
    
    const mockResponse = `[ChatGPT-4 Response] I understand you're asking about: ${prompt.slice(0, 50)}...

Let me provide a comprehensive response:

**Analysis:**
- Key point 1 addressing your query
- Relevant context and background information
- Practical implications and applications

**Recommendations:**
- Actionable insights based on your needs
- Best practices and considerations
- Next steps you might consider

I'm here to help with any follow-up questions you might have.`

    return {
      provider: LLMProvider.CHATGPT,
      response: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4),
      latencyMs: Date.now() - startTime,
      model: 'gpt-4-turbo',
      timestamp: new Date(),
    }
  }

  // Route to appropriate provider
  static async call(provider: LLMProvider, prompt: string, temperature: number, maxTokens: number): Promise<LLMResponse> {
    switch (provider) {
      case LLMProvider.PERPLEXITY:
        return this.callPerplexity(prompt, temperature, maxTokens)
      case LLMProvider.GEMINI:
        return this.callGemini(prompt, temperature, maxTokens)
      case LLMProvider.CHATGPT:
        return this.callChatGPT(prompt, temperature, maxTokens)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }
}
