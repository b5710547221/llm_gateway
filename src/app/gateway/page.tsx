'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LLMProvider } from '@/types/llm.types'

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

export default function GatewayDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState<LLMProvider | ''>('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: provider || undefined,
          userId: user?.id || 'anonymous',
          temperature: 0.7,
          maxTokens: 1000,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Request failed')
        setResponse(data)
      } else {
        setResponse(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🛡️ NCSC Secure GenAI Gateway Platform
              </h1>
              <p className="text-gray-600">
                On-Premise GPU Server Infrastructure with Enterprise Security
              </p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Welcome, <span className="font-semibold">{user.name}</span> ({user.email})
                  {user.role === 'admin' && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Admin</span>}
                </p>
              )}
            </div>
            <div className="text-right space-y-2">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <span className="text-sm font-semibold">Status: </span>
                <span className="text-sm">🟢 Active</span>
              </div>
              <div className="flex gap-2">
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                💬 Secure AI Gateway Interface
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Select LLM Provider
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProvider('')}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        provider === ''
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🤖</span>
                        <span className="font-semibold text-gray-900">Auto-Select</span>
                      </div>
                      <p className="text-xs text-gray-600">Routing Engine</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvider('perplexity' as LLMProvider)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        provider === 'perplexity'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🔍</span>
                        <span className="font-semibold text-gray-900">Perplexity</span>
                      </div>
                      <p className="text-xs text-gray-600">Real-time search</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvider('gemini' as LLMProvider)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        provider === 'gemini'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💎</span>
                        <span className="font-semibold text-gray-900">Gemini Pro</span>
                      </div>
                      <p className="text-xs text-gray-600">Multi-modal AI</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvider('chatgpt' as LLMProvider)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        provider === 'chatgpt'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💬</span>
                        <span className="font-semibold text-gray-900">ChatGPT-4</span>
                      </div>
                      <p className="text-xs text-gray-600">Advanced reasoning</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="query-input" className="block text-sm font-medium mb-2 text-gray-700">
                    Your Query
                  </label>
                  <textarea
                    id="query-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your query here... (will be processed through guardrails)"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
                >
                  {loading ? '🔄 Processing through Gateway...' : '🚀 Submit Query'}
                </button>
              </form>

              {/* Response Section */}
              {response && (
                <div className="mt-6">
                  {response.success ? (
                    <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-green-800 mb-2">
                            Response from {response.data.provider.toUpperCase()}
                          </h3>
                          <div className="bg-white p-4 rounded border border-green-200 mb-3">
                            <p className="text-gray-900 whitespace-pre-wrap">
                              {response.data.response}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                            <div>Model: {response.data.model}</div>
                            <div>Tokens: {response.data.tokensUsed}</div>
                            <div>Latency: {response.data.latencyMs}ms</div>
                            <div>Input Risk: {response.data.guardrails.inputRiskLevel}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">🛑</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 mb-2">
                            Guardrail Violation Detected
                          </h3>
                          <p className="text-red-700 mb-2">{error || response.error}</p>
                          {response.violations && (
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {response.violations.map((v: string, i: number) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          )}
                          {response.riskLevel && (
                            <div className="mt-2 text-xs text-red-600">
                              Risk Level: <span className="font-bold uppercase">{response.riskLevel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && !response && (
                <div className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
          </div>
        </div>
      </div>
    </div>
  )
}
