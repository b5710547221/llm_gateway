// Guardrail Policy Engine (TOR 1.3)
// Input Control, PII Sanitization, Injection Detection, Output Control

import { PIIDetection, InjectionDetection, GuardrailCheck } from '@/types/guardrail.types'

export class GuardrailPolicyEngine {
  // TOR 1.3.1 - Input Control & PII Sanitization
  static detectAndSanitizePII(text: string): PIIDetection {
    const piiPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      address: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi,
    }

    const detectedPII: Array<'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name'> = []
    let sanitized = text

    // Detect and redact email
    if (piiPatterns.email.test(text)) {
      detectedPII.push('email')
      sanitized = sanitized.replace(piiPatterns.email, '[EMAIL_REDACTED]')
    }

    // Detect and redact phone
    if (piiPatterns.phone.test(text)) {
      detectedPII.push('phone')
      sanitized = sanitized.replace(piiPatterns.phone, '[PHONE_REDACTED]')
    }

    // Detect and redact SSN
    if (piiPatterns.ssn.test(text)) {
      detectedPII.push('ssn')
      sanitized = sanitized.replace(piiPatterns.ssn, '[SSN_REDACTED]')
    }

    // Detect and redact credit card
    if (piiPatterns.credit_card.test(text)) {
      detectedPII.push('credit_card')
      sanitized = sanitized.replace(piiPatterns.credit_card, '[CARD_REDACTED]')
    }

    // Detect and redact address
    if (piiPatterns.address.test(text)) {
      detectedPII.push('address')
      sanitized = sanitized.replace(piiPatterns.address, '[ADDRESS_REDACTED]')
    }

    return {
      hasPII: detectedPII.length > 0,
      piiTypes: detectedPII,
      sanitized,
    }
  }

  // TOR 1.3.2 - Injection Detection
  static detectInjection(text: string): InjectionDetection {
    const injectionPatterns = {
      sql: /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/i,
      prompt: /(ignore\s+previous\s+instructions|disregard\s+all\s+prior|forget\s+everything|new\s+instructions:|system\s+prompt:|override\s+instructions)/i,
      xss: /(<script|javascript:|onerror=|onload=|<iframe|eval\(|document\.cookie)/i,
      command: /(\||;|&&|\$\(|`|>\s*\/|<\s*\/)/,
    }

    for (const [type, pattern] of Object.entries(injectionPatterns)) {
      if (pattern.test(text)) {
        return {
          isInjection: true,
          injectionType: type as 'sql' | 'prompt' | 'xss' | 'command',
          confidence: 0.85,
        }
      }
    }

    return {
      isInjection: false,
      injectionType: 'none',
      confidence: 0.0,
    }
  }

  // TOR 1.3.3 - Comprehensive Input Validation
  static validateInput(text: string): GuardrailCheck {
    const violations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Check for PII
    const piiCheck = this.detectAndSanitizePII(text)
    if (piiCheck.hasPII) {
      violations.push(`PII detected: ${piiCheck.piiTypes.join(', ')}`)
      riskLevel = 'medium'
    }

    // Check for injection attempts
    const injectionCheck = this.detectInjection(text)
    if (injectionCheck.isInjection) {
      violations.push(`${injectionCheck.injectionType} injection detected`)
      riskLevel = 'critical'
    }

    // Check for excessive length
    if (text.length > 10000) {
      violations.push('Input exceeds maximum length')
      riskLevel = riskLevel === 'critical' ? 'critical' : 'medium'
    }

    // Check for malicious URLs
    const urlPattern = /(https?:\/\/[^\s]+)/gi
    const urls = text.match(urlPattern)
    if (urls && urls.length > 5) {
      violations.push('Excessive URLs detected')
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high'
    }

    return {
      passed: violations.length === 0,
      violations,
      sanitizedText: piiCheck.sanitized,
      riskLevel,
    }
  }

  // TOR 1.3.4 - Output Control & Data Filtering
  static validateOutput(text: string): GuardrailCheck {
    const violations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Check for sensitive data in output
    const piiCheck = this.detectAndSanitizePII(text)
    if (piiCheck.hasPII) {
      violations.push(`Output contains PII: ${piiCheck.piiTypes.join(', ')}`)
      riskLevel = 'high'
    }

    // Check for code execution attempts
    if (/<script|eval\(|exec\(|system\(/i.test(text)) {
      violations.push('Output contains potentially executable code')
      riskLevel = 'critical'
    }

    // Check for sensitive keywords
    const sensitivePatterns = [
      /password|secret|api[_-]?key|token|credential/i,
      /private[_-]?key|ssh[_-]?key|access[_-]?token/i,
    ]

    for (const pattern of sensitivePatterns) {
      if (pattern.test(text)) {
        violations.push('Output contains sensitive keywords')
        riskLevel = riskLevel === 'critical' ? 'critical' : 'high'
        break
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      sanitizedText: piiCheck.sanitized,
      riskLevel,
    }
  }
}
