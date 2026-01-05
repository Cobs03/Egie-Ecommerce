# Third-Party Service Compliance Tracker

## Overview
This document tracks all third-party services integrated with the Egie E-commerce platform and their GDPR/CCPA compliance status.

---

## Third-Party Services Registry

### 1. PayMongo (Payment Processing)
**Service Type:** Payment Gateway  
**Data Processed:** 
- Credit card numbers (tokenized)
- Billing names and addresses
- Email addresses
- Phone numbers
- Transaction amounts

**Purpose:** Process credit card and e-wallet (GCash) payments

**Data Transfer Location:** Philippines/Singapore (PayMongo servers)

**Compliance Status:**
- ✅ PCI DSS Level 1 Certified
- ✅ ISO 27001 Certified
- ✅ Compliant with BSP regulations
- ⚠️ DPA Required - Not yet executed
- 🔒 Data encrypted in transit (TLS 1.2+)
- 🔒 No raw card data stored in our system

**Legal Basis:** Contractual necessity (payment processing)

**Retention Period:** Transaction records retained for 7 years (compliance requirement)

**User Rights:** Users can request transaction history deletion after retention period

**Privacy Policy:** https://www.paymongo.com/privacy

**Last Compliance Review:** January 5, 2026

---

### 2. Groq AI (AI Assistant & Chat)
**Service Type:** AI/Machine Learning API  
**Data Processed:**
- Chat messages (product queries)
- User preferences (implicit from conversations)
- Session IDs (anonymized)
- Product interaction data

**Purpose:** Provide AI-powered shopping assistant and product recommendations

**Data Transfer Location:** United States (Groq servers)

**Compliance Status:**
- ✅ SOC 2 Type II Certified
- ✅ GDPR-compliant data processing
- ⚠️ DPA Required - Not yet executed
- ⚠️ No data retention guarantees documented
- 🔒 API communication over HTTPS
- ⚠️ Chat logs may be used for model improvement

**Legal Basis:** Legitimate interest (service improvement) + User consent

**Retention Period:** Unknown - needs clarification from Groq

**User Rights:** Right to deletion of conversation history

**Privacy Policy:** https://groq.com/privacy-policy/

**Last Compliance Review:** January 5, 2026

**Action Items:**
- [ ] Execute DPA with Groq
- [ ] Clarify data retention policies
- [ ] Implement user consent before AI interactions
- [ ] Add opt-out mechanism for AI features

---

### 3. OpenAI (Vision API - Optional)
**Service Type:** AI Vision/Image Recognition  
**Data Processed:**
- Uploaded product images
- Image analysis queries
- Session metadata

**Purpose:** Enable image-based product search functionality

**Data Transfer Location:** United States (OpenAI servers)

**Compliance Status:**
- ✅ SOC 2 Type II Certified
- ✅ GDPR-compliant (EU representative appointed)
- ⚠️ DPA Required - Not yet executed
- ⚠️ 30-day data retention by default
- 🔒 API communication over HTTPS
- ⚠️ Images may be used for model improvement (unless opted out)

**Legal Basis:** User consent (feature is optional)

**Retention Period:** 30 days (can be zero with API flag)

**User Rights:** Right to deletion, right to opt-out

**Privacy Policy:** https://openai.com/policies/privacy-policy

**Last Compliance Review:** January 5, 2026

**Action Items:**
- [ ] Execute DPA with OpenAI
- [ ] Enable zero-retention API flag
- [ ] Implement explicit consent before image upload
- [ ] Add privacy notice on image search feature

---

### 4. Resend (Email Service)
**Service Type:** Transactional Email Provider  
**Data Processed:**
- Email addresses
- User names
- Email content (order confirmations, notifications)
- Delivery metadata

**Purpose:** Send transactional emails (order updates, password resets, notifications)

**Data Transfer Location:** United States (AWS infrastructure)

**Compliance Status:**
- ✅ GDPR-compliant
- ✅ Hosted on AWS (SOC 2, ISO 27001)
- ⚠️ DPA Required - Not yet executed
- ✅ 90-day automatic email log deletion
- 🔒 Emails encrypted in transit (TLS)
- 🔒 Emails encrypted at rest (AWS KMS)

**Legal Basis:** Contractual necessity (order confirmations) + Legitimate interest (security notifications)

**Retention Period:** Email logs deleted after 90 days

**User Rights:** Right to deletion of email logs

**Privacy Policy:** https://resend.com/legal/privacy-policy

**Last Compliance Review:** January 5, 2026

**Action Items:**
- [ ] Execute DPA with Resend
- [ ] Verify email retention settings
- [ ] Document which emails are contractually necessary vs. optional

---

### 5. Supabase (Backend Infrastructure)
**Service Type:** Backend-as-a-Service (Database, Auth, Storage, Edge Functions)  
**Data Processed:**
- All user data (profiles, orders, reviews, addresses)
- Authentication credentials (hashed)
- File uploads (product images, avatars)
- Application logs

**Purpose:** Primary backend infrastructure and database

**Data Transfer Location:** Singapore/US (configurable region)

**Compliance Status:**
- ✅ SOC 2 Type II Certified
- ✅ ISO 27001 Certified
- ✅ GDPR-compliant
- ✅ HIPAA compliant (optional)
- ✅ DPA available in Enterprise plan
- 🔒 Encryption at rest (AES-256)
- 🔒 Encryption in transit (TLS 1.2+)
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic backups

**Legal Basis:** Contractual necessity

**Retention Period:** User-controlled (manual deletion required)

**User Rights:** Full data portability, right to deletion, right to access

**Privacy Policy:** https://supabase.com/privacy

**Last Compliance Review:** January 5, 2026

**Action Items:**
- [ ] Upgrade to plan with DPA if required
- [ ] Configure data region to EU for GDPR users (if needed)
- [ ] Implement automated data deletion after account closure

---

## Data Minimization Summary

| Service | Data Shared | Necessary? | Can be Reduced? |
|---------|-------------|------------|-----------------|
| PayMongo | Payment details, billing info | ✅ Yes (contractual) | ❌ No - Required for processing |
| Groq AI | Chat messages, preferences | ⚠️ Optional feature | ✅ Yes - Anonymize user IDs |
| OpenAI | Images, queries | ⚠️ Optional feature | ✅ Yes - Zero retention mode |
| Resend | Email, name, order details | ✅ Yes (contractual) | ⚠️ Partially - Minimize email content |
| Supabase | All application data | ✅ Yes (infrastructure) | ❌ No - Primary database |

---

## Required Actions for Full Compliance

### High Priority
1. **Execute Data Processing Agreements (DPAs)** with all third-party services
2. **Implement explicit consent** for optional services (AI features)
3. **Add opt-out mechanisms** for non-essential features
4. **Document data retention** policies for each service

### Medium Priority
5. **Enable zero-retention modes** where available (OpenAI)
6. **Implement audit logging** for all third-party data transfers
7. **Add privacy notices** before using third-party features
8. **Regular compliance reviews** (quarterly)

### Low Priority
9. **Vendor security assessments** (annual)
10. **Alternative provider evaluation** for redundancy

---

## Contact Information

### Data Protection Officers (DPOs)
- **PayMongo:** dpo@paymongo.com
- **Groq:** privacy@groq.com
- **OpenAI:** privacy@openai.com
- **Resend:** privacy@resend.com
- **Supabase:** privacy@supabase.io

---

## Revision History
- **January 5, 2026:** Initial compliance tracker created
- **[Next Review Date]:** March 5, 2026 (Quarterly review)
