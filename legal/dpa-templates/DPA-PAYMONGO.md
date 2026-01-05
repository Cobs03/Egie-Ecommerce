# DATA PROCESSING AGREEMENT
## PayMongo Payment Processing Services

**Effective Date:** [TO BE EXECUTED]  
**Agreement Reference:** DPA-2026-PAYMONGO

---

## PARTIES

**Data Controller:** Egie E-commerce  
**Data Processor:** PayMongo Philippines, Inc.

---

## PROCESSING DETAILS

### Purpose of Processing
- Payment card processing (Credit/Debit cards)
- E-wallet payment processing (GCash, GrabPay)
- Payment verification and authorization
- Fraud prevention and detection
- Transaction record keeping
- Chargeback management

### Types of Personal Data Processed
- **Payment Information:** Card numbers (tokenized), CVV, expiry dates
- **Billing Information:** Name, email, phone, billing address
- **Transaction Data:** Amount, currency, timestamp, merchant details
- **Device Information:** IP address, user agent, device fingerprint (for fraud prevention)

### Categories of Data Subjects
- Customers making purchases
- Individuals initiating payment transactions

### Processing Location
- Primary: Philippines (PayMongo servers)
- Backup: Singapore (AWS Asia-Pacific region)

### Sub-processors
1. Stripe, Inc. (US) - Payment infrastructure
2. Amazon Web Services (AWS) - Cloud hosting
3. [To be confirmed with PayMongo]

---

## SPECIFIC OBLIGATIONS

### Data Retention
- Transaction records: 7 years (BSP compliance requirement)
- Failed transaction logs: 90 days
- Card tokens: Until customer removal or account deletion

### Security Measures
- ✅ PCI DSS Level 1 Compliance
- ✅ TLS 1.2+ encryption for all data transmission
- ✅ Tokenization of card data (no raw card numbers stored)
- ✅ Multi-factor authentication for admin access
- ✅ Regular penetration testing
- ✅ SOC 2 Type II certified infrastructure

### Data Subject Rights Support
PayMongo shall assist with:
- Transaction history access requests (within 7 business days)
- Card data deletion (tokenized data only)
- Payment method removal
- Transaction dispute investigation

### Breach Notification
- Notification to Egie within 12 hours of confirmed breach
- Detailed incident report within 48 hours
- Customer notification assistance if required

---

## SPECIAL TERMS

### Payment Card Data
- Egie E-commerce shall NEVER store raw card data
- All card data handled via PayMongo.js (client-side tokenization)
- Card tokens used for recurring payments must be explicitly consented

### Regulatory Compliance
- Compliance with BSP Circular No. 1048 (Data Privacy)
- Compliance with Payment Card Industry Data Security Standard (PCI DSS)
- Compliance with Philippine Data Privacy Act of 2012

### Service-Specific Limitations
- PayMongo retains transaction data for legal/regulatory compliance
- Certain data cannot be deleted during chargeback dispute period (180 days)
- Transaction logs required for financial audits

---

## ANNEXES

### Annex A: Technical Security Measures
Refer to: https://www.paymongo.com/security

### Annex B: Compliance Certifications
- PCI DSS Level 1 Certificate
- ISO 27001:2013 Certificate  
- SOC 2 Type II Report

### Annex C: Sub-processor List
To be provided by PayMongo upon DPA execution

---

## EXECUTION STATUS

**Status:** ⚠️ **PENDING EXECUTION**

**Action Required:**
1. Contact PayMongo compliance team: compliance@paymongo.com
2. Request DPA under business plan
3. Review and execute DPA
4. Obtain copies of compliance certificates
5. Document sub-processor list

**Target Completion:** Q1 2026

---

**Document Reference:** DPA-2026-PAYMONGO  
**Version:** 1.0  
**Last Updated:** January 5, 2026
