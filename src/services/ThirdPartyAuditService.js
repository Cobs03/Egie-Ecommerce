/**
 * Third-Party Data Sharing Audit Log Service
 * Tracks and logs all data shared with third-party services for compliance
 */

import { supabase } from '../lib/supabase';
import { pseudonymizeUserId, maskEmail, sanitizeLogData } from '../utils/PrivacyUtils';

class ThirdPartyAuditService {
  /**
   * Log data sharing event with third party
   * @param {string} service - Name of third-party service
   * @param {string} purpose - Purpose of data sharing
   * @param {Array} dataTypes - Types of data shared
   * @param {string} userId - User ID (will be pseudonymized)
   * @param {object} metadata - Additional context
   */
  static async logDataSharing(service, purpose, dataTypes, userId = null, metadata = {}) {
    try {
      const logEntry = {
        service_name: service,
        purpose: purpose,
        data_types: dataTypes,
        user_id: userId ? pseudonymizeUserId(userId) : null,
        timestamp: new Date().toISOString(),
        metadata: sanitizeLogData(metadata),
        session_id: this.getSessionId()
      };

      // Log to database if table exists
      try {
        const { error } = await supabase
          .from('third_party_audit_logs')
          .insert(logEntry);

        if (error) {
          // Table might not exist, log to console instead
          console.warn('Third-party audit log table not found, logging to console');
          console.log('[THIRD-PARTY AUDIT]', JSON.stringify(logEntry, null, 2));
        }
      } catch (dbError) {
        // Fallback to local storage for critical compliance tracking
        this.logToLocalStorage(logEntry);
      }

      return { success: true, logEntry };
    } catch (error) {
      console.error('Error logging third-party data sharing:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log PayMongo payment processing
   */
  static async logPayMongoTransaction(userId, transactionData) {
    return await this.logDataSharing(
      'PayMongo',
      'Payment Processing',
      ['billing_name', 'billing_email', 'billing_address', 'payment_amount', 'payment_method'],
      userId,
      {
        transaction_type: transactionData.payment_method,
        amount: transactionData.amount,
        currency: 'PHP'
      }
    );
  }

  /**
   * Log Groq AI interaction
   */
  static async logGroqAIInteraction(userId, messageData) {
    return await this.logDataSharing(
      'Groq AI',
      'AI Shopping Assistant',
      ['chat_message', 'session_id', 'product_preferences'],
      userId,
      {
        message_length: messageData.message?.length || 0,
        has_user_consent: messageData.consent || false
      }
    );
  }

  /**
   * Log OpenAI Vision API usage
   */
  static async logOpenAIVisionUsage(userId, imageData) {
    return await this.logDataSharing(
      'OpenAI Vision',
      'Image-based Product Search',
      ['uploaded_image', 'image_metadata'],
      userId,
      {
        image_size: imageData.size || 'unknown',
        has_user_consent: imageData.consent || false
      }
    );
  }

  /**
   * Log Resend email sending
   */
  static async logResendEmail(userId, emailData) {
    return await this.logDataSharing(
      'Resend',
      'Transactional Email',
      ['email_address', 'recipient_name', 'email_content'],
      userId,
      {
        email_type: emailData.type || 'unknown',
        recipient_email: maskEmail(emailData.to)
      }
    );
  }

  /**
   * Get or create session ID for tracking
   */
  static getSessionId() {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Fallback: Log to localStorage when database unavailable
   */
  static logToLocalStorage(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('third_party_audit_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }
      
      localStorage.setItem('third_party_audit_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log to localStorage:', error);
    }
  }

  /**
   * Get audit logs for a user (admin only)
   */
  static async getUserAuditLogs(userId, limit = 50) {
    try {
      const pseudoId = pseudonymizeUserId(userId);
      
      const { data, error } = await supabase
        .from('third_party_audit_logs')
        .select('*')
        .eq('user_id', pseudoId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, logs: data || [] };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error: error.message, logs: [] };
    }
  }

  /**
   * Get compliance report for date range
   */
  static async getComplianceReport(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('third_party_audit_logs')
        .select('service_name, purpose, data_types, timestamp')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (error) throw error;

      // Aggregate by service
      const report = data.reduce((acc, log) => {
        if (!acc[log.service_name]) {
          acc[log.service_name] = {
            service: log.service_name,
            total_events: 0,
            purposes: new Set(),
            data_types: new Set()
          };
        }
        
        acc[log.service_name].total_events++;
        acc[log.service_name].purposes.add(log.purpose);
        log.data_types.forEach(type => acc[log.service_name].data_types.add(type));
        
        return acc;
      }, {});

      // Convert Sets to Arrays
      Object.values(report).forEach(service => {
        service.purposes = Array.from(service.purposes);
        service.data_types = Array.from(service.data_types);
      });

      return { success: true, report: Object.values(report) };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return { success: false, error: error.message, report: [] };
    }
  }

  /**
   * Check if user has consented to third-party service
   */
  static async checkUserConsent(userId, service) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_consents')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const consents = data?.user_consents || {};
      const consentMapping = {
        'Groq AI': 'aiAssistant',
        'OpenAI Vision': 'aiAssistant',
        'Resend': 'emailCommunications',
        'PayMongo': true, // Always required for payments
        'Supabase': true // Always required for service
      };

      const consentKey = consentMapping[service];
      return consentKey === true || consents[consentKey] === true;
    } catch (error) {
      console.error('Error checking user consent:', error);
      return false;
    }
  }
}

export default ThirdPartyAuditService;
