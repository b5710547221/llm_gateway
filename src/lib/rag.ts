// RAG (Retrieval Augmented Generation) System (TOR 1.5)
// Secure Vector DB for knowledge management

import { z } from 'zod'

export const documentSchema = z.object({
  id: z.string().cuid(),
  content: z.string(),
  embedding: z.array(z.number()).optional(),
  metadata: z.object({
    source: z.string(),
    title: z.string(),
    createdAt: z.date(),
    classification: z.enum(['public', 'internal', 'confidential', 'secret']),
    tags: z.array(z.string()),
  }),
})

export type Document = z.infer<typeof documentSchema>

export interface SearchResult {
  document: Document
  similarity: number
  relevanceScore: number
}

export class RAGSystem {
  private vectorDB: Map<string, Document>
  private readonly embeddingDimension = 384

  constructor() {
    this.vectorDB = new Map()
    this.initializeSampleDocuments()
  }

  // TOR 1.5.1 - Initialize with sample secure documents
  private initializeSampleDocuments() {
    const sampleDocs: Document[] = [
      {
        id: 'doc_001',
        content: 'NCSC Cybersecurity Guidelines: Implementing multi-factor authentication is essential for protecting sensitive systems. MFA should be enforced for all administrative access.',
        metadata: {
          source: 'NCSC Guidelines',
          title: 'Multi-Factor Authentication Best Practices',
          createdAt: new Date('2024-01-15'),
          classification: 'internal',
          tags: ['security', 'mfa', 'authentication'],
        },
      },
      {
        id: 'doc_002',
        content: 'Data Protection Compliance: Under GDPR and PDPA regulations, organizations must implement appropriate technical and organizational measures to ensure data security.',
        metadata: {
          source: 'Compliance Documentation',
          title: 'GDPR/PDPA Compliance Requirements',
          createdAt: new Date('2024-02-20'),
          classification: 'internal',
          tags: ['gdpr', 'pdpa', 'compliance'],
        },
      },
      {
        id: 'doc_003',
        content: 'Secure AI/GenAI Gateway Implementation: All AI interactions must pass through guardrails including PII detection, prompt injection prevention, and output validation.',
        metadata: {
          source: 'Technical Documentation',
          title: 'AI Gateway Security Architecture',
          createdAt: new Date('2024-03-10'),
          classification: 'confidential',
          tags: ['ai', 'security', 'guardrails'],
        },
      },
    ]

    for (const doc of sampleDocs) {
      this.vectorDB.set(doc.id, doc)
    }
  }

  // TOR 1.5.2 - Simple embedding simulation (cosine similarity)
  private generateEmbedding(text: string): number[] {
    // Mock embedding generation using simple hash-based approach
    const embedding: number[] = []
    const hash = this.simpleHash(text)
    
    for (let i = 0; i < this.embeddingDimension; i++) {
      embedding.push(Math.sin(hash + i) * 0.5 + 0.5)
    }
    
    return embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash
  }

  // TOR 1.5.3 - Calculate cosine similarity
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // TOR 1.5.4 - Search for relevant documents
  async search(query: string, topK: number = 3, minSimilarity: number = 0.3): Promise<SearchResult[]> {
    const queryEmbedding = this.generateEmbedding(query)
    const results: SearchResult[] = []

    // Convert to Array to avoid MapIterator issues
    const documents = Array.from(this.vectorDB.values())
    
    for (const doc of documents) {
      const docEmbedding = doc.embedding || this.generateEmbedding(doc.content)
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding)

      if (similarity >= minSimilarity) {
        // Calculate relevance score based on keyword matching
        const queryWords = query.toLowerCase().split(/\s+/)
        const contentWords = doc.content.toLowerCase().split(/\s+/)
        const matchCount = queryWords.filter(word => 
          contentWords.some((cWord: string) => cWord.includes(word))
        ).length
        const relevanceScore = (similarity * 0.7) + (matchCount / queryWords.length * 0.3)

        results.push({
          document: doc,
          similarity,
          relevanceScore,
        })
      }
    }

    // Sort by relevance score and return top K
    const sortedResults = results.slice().sort((a, b) => b.relevanceScore - a.relevanceScore)
    return sortedResults.slice(0, topK)
  }

  // TOR 1.5.5 - Add document to vector DB
  async addDocument(doc: Omit<Document, 'id' | 'embedding'>): Promise<Document> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const embedding = this.generateEmbedding(doc.content)
    
    const newDoc: Document = {
      ...doc,
      id,
      embedding,
    }

    this.vectorDB.set(id, newDoc)
    return newDoc
  }

  // TOR 1.5.6 - Get document by ID with security check
  async getDocument(id: string, userClearanceLevel: string): Promise<Document | null> {
    const doc = this.vectorDB.get(id)
    
    if (!doc) return null

    // Security check based on classification
    const clearanceLevels = ['public', 'internal', 'confidential', 'secret']
    const userLevel = clearanceLevels.indexOf(userClearanceLevel)
    const docLevel = clearanceLevels.indexOf(doc.metadata.classification)

    if (userLevel < docLevel) {
      throw new Error('Insufficient clearance level to access this document')
    }

    return doc
  }

  // TOR 1.5.7 - Augment prompt with relevant context
  async augmentPrompt(query: string): Promise<string> {
    const relevantDocs = await this.search(query, 3, 0.4)
    
    if (relevantDocs.length === 0) {
      return query
    }

    const context = relevantDocs
      .map((result, idx) => 
        `[Context ${idx + 1}] (Relevance: ${(result.relevanceScore * 100).toFixed(1)}%)\n${result.document.content}`
      )
      .join('\n\n')

    return `Based on the following relevant information:\n\n${context}\n\n---\n\nUser Query: ${query}`
  }
}
