# DATA PROCESSING AGREEMENT
## Groq AI Services

**Effective Date:** [TO BE EXECUTED]  
**Agreement Reference:** DPA-2026-GROQ

---

## PARTIES

**Data Controller:** Egie E-commerce  
**Data Processor:** Groq, Inc.

---

## PROCESSING DETAILS

### Purpose of Processing
- AI-powered product recommendations
- Natural language chat assistance
- Product search and discovery
- Shopping intent analysis
- Conversation history for context

### Types of Personal Data Processed
- **Chat Messages:** User queries, product preferences, shopping questions
- **Session Data:** Anonymous session IDs, timestamps
- **Interaction Data:** Product views, click patterns (pseudonymized)
- **Metadata:** Language preferences, browsing context

**Note:** No directly identifiable information (names, emails, addresses) should be sent to Groq

### Categories of Data Subjects
- Website visitors using AI chat features
- Customers seeking product recommendations

### Processing Location
- United States (Groq infrastructure)

### Sub-processors
To be confirmed with Groq

---

## SPECIFIC OBLIGATIONS

### Data Minimization
- Egie shall implement pseudonymization before sending data to Groq
- No user IDs, emails, or personal identifiers to be included in queries
- Session-based anonymous IDs only

### Data Retention
- **Groq's Standard:** 30 days (to be confirmed)
- **Requested:** Zero retention or 7 days maximum
- Chat history stored locally by Egie (user-controlled deletion)

### Security Measures
- ✅ HTTPS/TLS encryption for all API calls
- ✅ API key authentication
- ✅ Rate limiting and abuse prevention
- ⚠️ Model training opt-out required

### Model Training Opt-Out
**CRITICAL:** Egie data must NOT be used for Groq model training
- Request zero-retention mode
- Opt-out of data usage for model improvement
- Require data deletion after response generation

### Data Subject Rights Support
Groq shall assist with:
- Deletion of conversation data
- Access to processing logs
- Confirmation of data deletion

### Breach Notification
- Notification within 24 hours of any data exposure
- Immediate API key rotation if compromised

---

## CONSENT REQUIREMENTS

### User Consent
Before using Groq AI features, users must:
- ✅ Be informed that AI analysis is used
- ✅ Consent to chat message processing
- ✅ Be able to opt-out and use manual search instead
- ✅ Be informed data is processed in the United States

### Consent Mechanism
- Explicit consent checkbox before first AI interaction
- "Powered by Groq AI" disclosure
- Link to Groq privacy policy
- Option to disable AI features in settings

---

## DATA FLOW

### Input to Groq
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Show me gaming laptops under $1500"
    }
  ],
  "session_id": "anon_1704528000_abc123",
  "context": {
    "category": "laptops",
    "price_range": "0-1500"
  }
}
```

### Prohibited Data
- ❌ Real names
- ❌ Email addresses  
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ User account IDs (use pseudonymized IDs only)

---

## SPECIAL TERMS

### API Usage Restrictions
- API key must be stored server-side only (edge functions)
- No client-side exposure of API credentials
- Monitor API usage for anomalies

### Service Limitations
- Groq may retain metadata for service operation
- Models may cache responses (clarification needed)
- Training data separation must be guaranteed

### Alternative Processing
If DPA not achievable:
- Consider self-hosted LLM alternatives
- Implement on-device AI processing
- Use rule-based recommendation system

---

## EXECUTION STATUS

**Status:** ⚠️ **PENDING EXECUTION**

**Action Required:**
1. Contact Groq: privacy@groq.com
2. Request DPA and data processing terms
3. Confirm zero-retention mode availability
4. Opt-out of model training
5. Obtain sub-processor list
6. Implement user consent flow

**Blockers:**
- Unknown if Groq offers DPAs for API customers
- Data retention policy needs clarification
- Model training opt-out mechanism unknown

**Alternative Actions if DPA Unavailable:**
- Migrate to OpenAI (DPA available)
- Use Anthropic Claude (DPA available)
- Implement local AI models

**Target Completion:** Q1 2026

---

**Document Reference:** DPA-2026-GROQ  
**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Risk Level:** ⚠️ MEDIUM (DPA availability uncertain)
