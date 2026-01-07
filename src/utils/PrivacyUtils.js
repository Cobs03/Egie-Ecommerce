/**
 * Privacy Utilities for GDPR/CCPA Compliance
 * Provides data masking, anonymization, and pseudonymization functions
 */

import CryptoJS from 'crypto-js';

// Encryption key - In production, store this securely (environment variable)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'egie-default-encryption-key-2026';

/**
 * Email Masking
 * Masks email addresses while keeping first and last character of username
 * Example: john.doe@example.com -> j******e@example.com
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
};

/**
 * Phone Number Masking
 * Masks phone numbers, showing only last 4 digits
 * Example: +639171234567 -> *******4567
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length <= 4) return phone;
  
  return '*'.repeat(digitsOnly.length - 4) + digitsOnly.slice(-4);
};

/**
 * Address Masking
 * Masks street address while keeping city/province
 * Example: "123 Main St, Manila, Metro Manila" -> "*** ****, Manila, Metro Manila"
 */
export const maskAddress = (address) => {
  if (!address || typeof address !== 'string') return '';
  
  const parts = address.split(',').map(p => p.trim());
  if (parts.length === 0) return address;
  
  // Mask first part (street address), keep city/province
  const maskedStreet = parts[0].split(' ').map(() => '***').join(' ');
  const remainingParts = parts.slice(1);
  
  return [maskedStreet, ...remainingParts].join(', ');
};

/**
 * Credit Card Masking
 * Shows only last 4 digits
 * Example: 1234567890123456 -> **** **** **** 3456
 */
export const maskCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') return '';
  
  const digitsOnly = cardNumber.replace(/\D/g, '');
  if (digitsOnly.length < 4) return cardNumber;
  
  const lastFour = digitsOnly.slice(-4);
  const maskedPart = '**** **** **** ';
  
  return maskedPart + lastFour;
};

/**
 * Name Masking
 * Masks middle characters of names
 * Example: "John Michael Doe" -> "J*** M****** D**"
 */
export const maskName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name.split(' ').map(part => {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(part.length - 1);
  }).join(' ');
};

/**
 * Pseudonymization
 * Creates a consistent hash for user identification without revealing actual ID
 * Uses SHA-256 hashing
 */
export const pseudonymizeUserId = (userId) => {
  if (!userId) return 'anonymous';
  
  const hash = CryptoJS.SHA256(userId + ENCRYPTION_KEY).toString();
  return `user_${hash.substring(0, 16)}`;
};

/**
 * Anonymize User Data
 * Removes or masks all personally identifiable information
 */
export const anonymizeUserData = (userData) => {
  if (!userData || typeof userData !== 'object') return null;
  
  return {
    id: pseudonymizeUserId(userData.id),
    // Remove direct identifiers
    email: maskEmail(userData.email),
    phone: userData.phone ? maskPhone(userData.phone) : null,
    first_name: userData.first_name ? maskName(userData.first_name) : null,
    last_name: userData.last_name ? maskName(userData.last_name) : null,
    // Keep non-PII data
    created_at: userData.created_at,
    // Aggregate data only
    order_count: userData.order_count || 0,
    total_spent: userData.total_spent || 0,
  };
};

/**
 * Anonymize Order Data
 * Removes PII from order information for analytics
 */
export const anonymizeOrderData = (orderData) => {
  if (!orderData || typeof orderData !== 'object') return null;
  
  return {
    order_id: orderData.id,
    user_id: pseudonymizeUserId(orderData.user_id),
    total_amount: orderData.total_amount,
    items_count: orderData.items?.length || 0,
    created_at: orderData.created_at,
    status: orderData.status,
    // Remove shipping address details
    city: orderData.shipping_addresses?.city || null,
    province: orderData.shipping_addresses?.province || null,
    // No street address, name, or contact info
  };
};

/**
 * Field-level Encryption
 * Encrypts sensitive data before storage
 */
export const encryptField = (data) => {
  if (!data) return null;
  
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    return null;
  }
};

/**
 * Field-level Decryption
 * Decrypts encrypted data
 */
export const decryptField = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};

/**
 * Sanitize Log Data
 * Removes sensitive information from logs
 */
export const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // List of sensitive fields to mask
  const sensitiveFields = [
    'password', 'token', 'secret', 'api_key', 'apiKey',
    'email', 'phone', 'address', 'credit_card', 'creditCard',
    'ssn', 'social_security', 'passport'
  ];
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive terms
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      if (lowerKey.includes('email')) {
        sanitized[key] = maskEmail(sanitized[key]);
      } else if (lowerKey.includes('phone')) {
        sanitized[key] = maskPhone(sanitized[key]);
      } else {
        sanitized[key] = '***REDACTED***';
      }
    }
    
    // Recursively sanitize nested objects
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
};

/**
 * Generate Anonymous Analytics ID
 * Creates session-based anonymous ID for analytics tracking
 */
export const generateAnonymousId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `anon_${timestamp}_${random}`;
};

/**
 * Check if data contains PII
 * Validates if object contains personally identifiable information
 */
export const containsPII = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  const piiFields = ['email', 'phone', 'address', 'first_name', 'last_name', 'ssn', 'passport'];
  
  return Object.keys(data).some(key => 
    piiFields.some(field => key.toLowerCase().includes(field))
  );
};

export default {
  maskEmail,
  maskPhone,
  maskAddress,
  maskCreditCard,
  maskName,
  pseudonymizeUserId,
  anonymizeUserData,
  anonymizeOrderData,
  encryptField,
  decryptField,
  sanitizeLogData,
  generateAnonymousId,
  containsPII
};
