// Routing Engine (TOR 1.2)
// Routes requests to appropriate LLM providers based on load balancing, availability, and model capabilities

import { LLMProvider, LLMRequest } from '@/types/llm.types'

interface ProviderStatus {
  provider: LLMProvider
  available: boolean
  latency: number
  loadPercentage: number
  lastChecked: Date
}

export class RoutingEngine {
  private providerStatus: Map<LLMProvider, ProviderStatus>

  constructor() {
    // Initialize provider status
    this.providerStatus = new Map([
      [LLMProvider.PERPLEXITY, {
        provider: LLMProvider.PERPLEXITY,
        available: true,
        latency: 150,
        loadPercentage: 30,
        lastChecked: new Date(),
      }],
      [LLMProvider.GEMINI, {
        provider: LLMProvider.GEMINI,
        available: true,
        latency: 200,
        loadPercentage: 45,
        lastChecked: new Date(),
      }],
      [LLMProvider.CHATGPT, {
        provider: LLMProvider.CHATGPT,
        available: true,
        latency: 180,
        loadPercentage: 60,
        lastChecked: new Date(),
      }],
    ])
  }

  // TOR 1.2.1 - Select optimal provider based on request
  selectProvider(request: LLMRequest): LLMProvider {
    // If provider is explicitly specified, use it
    if (request.provider) {
      const status = this.providerStatus.get(request.provider)
      if (status?.available) {
        return request.provider
      }
    }

    // Smart routing based on:
    // 1. Availability
    // 2. Current load
    // 3. Latency
    const availableProviders = Array.from(this.providerStatus.values())
      .filter(p => p.available)
      .sort((a, b) => {
        // Calculate score: lower is better
        const scoreA = (a.loadPercentage * 0.5) + (a.latency * 0.3)
        const scoreB = (b.loadPercentage * 0.5) + (b.latency * 0.3)
        return scoreA - scoreB
      })

    if (availableProviders.length === 0) {
      throw new Error('No LLM providers available')
    }

    return availableProviders[0].provider
  }

  // TOR 1.2.2 - Update provider status
  updateProviderStatus(provider: LLMProvider, available: boolean, latency?: number) {
    const status = this.providerStatus.get(provider)
    if (status) {
      status.available = available
      if (latency !== undefined) {
        status.latency = latency
      }
      status.lastChecked = new Date()
    }
  }

  // TOR 1.2.3 - Get provider health status
  getProviderHealth(): Map<LLMProvider, ProviderStatus> {
    return new Map(this.providerStatus)
  }

  // TOR 1.2.4 - Load balancing
  updateLoadPercentage(provider: LLMProvider, loadPercentage: number) {
    const status = this.providerStatus.get(provider)
    if (status) {
      status.loadPercentage = Math.min(100, Math.max(0, loadPercentage))
    }
  }
}
