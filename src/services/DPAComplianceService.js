/**
 * DPA Compliance Service
 * Verifies that Data Processing Agreements are in place before sharing data
 * with third-party services
 */

import { supabase } from '../lib/supabase';

class DPAComplianceService {
  constructor() {
    // DPA compliance status for each third-party service
    // In production, this should be managed in database and admin dashboard
    this.complianceStatus = {
      paymongo: {
        dpaExecuted: false, // Set to true when DPA is signed
        lastReviewed: null,
        required: true,
        service: 'PayMongo',
        contactEmail: 'compliance@paymongo.com'
      },
      groq: {
        dpaExecuted: false, // Set to true when DPA is signed
        lastReviewed: null,
        required: false, // Optional service
        service: 'Groq AI',
        contactEmail: 'privacy@groq.com'
      },
      openai: {
        dpaExecuted: false, // Set to true when DPA is signed
        lastReviewed: null,
        required: false, // Optional service
        service: 'OpenAI',
        contactEmail: 'privacy@openai.com'
      },
      resend: {
        dpaExecuted: false, // Set to true when DPA is signed
        lastReviewed: null,
        required: true,
        service: 'Resend',
        contactEmail: 'privacy@resend.com'
      },
      supabase: {
        dpaExecuted: true, // Supabase has DPA available in Enterprise plan
        lastReviewed: '2026-01-01',
        required: true,
        service: 'Supabase',
        contactEmail: 'privacy@supabase.com'
      }
    };
  }

  /**
   * Check if a third-party service is compliant (DPA executed)
   * @param {string} serviceName - Service identifier (paymongo, groq, openai, resend)
   * @param {boolean} strict - If true, blocks if DPA not executed. If false, only warns.
   * @returns {Promise<Object>} Compliance check result
   */
  async checkCompliance(serviceName, strict = false) {
    const service = this.complianceStatus[serviceName.toLowerCase()];
    
    if (!service) {
      return {
        compliant: false,
        blocking: false,
        message: `Service ${serviceName} not recognized in compliance registry`
      };
    }

    // Check if DPA is executed
    if (!service.dpaExecuted) {
      const message = `⚠️ WARNING: No Data Processing Agreement (DPA) executed with ${service.service}. ` +
        `Contact ${service.contactEmail} to execute DPA. ` +
        `Template available at: /legal/dpa-templates/DPA-${serviceName.toUpperCase()}.md`;
      
      // Log compliance warning
      await this.logComplianceWarning(serviceName, message);
      
      // If strict mode and service is required, block the operation
      if (strict && service.required) {
        return {
          compliant: false,
          blocking: true,
          message: `Data Processing Agreement not executed with ${service.service}. ` +
            `Contact administrator to execute DPA before using this service.`,
          service: service.service,
          contactEmail: service.contactEmail
        };
      }
      
      return {
        compliant: false,
        blocking: false,
        warning: message,
        service: service.service,
        contactEmail: service.contactEmail
      };
    }

    // Check if review is overdue (should be reviewed annually)
    if (service.lastReviewed) {
      const reviewDate = new Date(service.lastReviewed);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (reviewDate < oneYearAgo) {
        const message = `⚠️ DPA with ${service.service} needs review (last reviewed: ${service.lastReviewed})`;
        await this.logComplianceWarning(serviceName, message);
      }
    }

    return {
      compliant: true,
      blocking: false,
      message: `DPA with ${service.service} is in place`,
      lastReviewed: service.lastReviewed
    };
  }

  /**
   * Log compliance warnings to database for audit trail
   * @param {string} serviceName - Service name
   * @param {string} message - Warning message
   */
  async logComplianceWarning(serviceName, message) {
    try {
      // Get current admin/system user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('compliance_warnings').insert({
        service_name: serviceName,
        warning_type: 'missing_dpa',
        message: message,
        reported_by: user?.id || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      // Don't throw - logging failure shouldn't block operations
    }
  }

  /**
   * Update DPA status (admin function)
   * @param {string} serviceName - Service name
   * @param {boolean} executed - Whether DPA is executed
   * @param {string} reviewDate - Last review date (YYYY-MM-DD)
   */
  async updateDPAStatus(serviceName, executed, reviewDate = null) {
    const service = this.complianceStatus[serviceName.toLowerCase()];
    
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    service.dpaExecuted = executed;
    service.lastReviewed = reviewDate || new Date().toISOString().split('T')[0];

    // In production, persist to database
    // Log the update
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('compliance_updates').insert({
        service_name: serviceName,
        dpa_executed: executed,
        review_date: service.lastReviewed,
        updated_by: user?.id || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
    }

    return {
      success: true,
      service: service.service,
      dpaExecuted: executed,
      lastReviewed: service.lastReviewed
    };
  }

  /**
   * Get compliance status for all services
   * @returns {Object} Compliance status for all services
   */
  getAllComplianceStatus() {
    return Object.entries(this.complianceStatus).map(([key, value]) => ({
      id: key,
      ...value,
      needsReview: this.needsReview(value.lastReviewed)
    }));
  }

  /**
   * Check if a service needs DPA review
   * @param {string} lastReviewed - Last review date
   * @returns {boolean} Whether review is needed
   */
  needsReview(lastReviewed) {
    if (!lastReviewed) return true;
    
    const reviewDate = new Date(lastReviewed);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return reviewDate < oneYearAgo;
  }

  /**
   * Generate compliance report
   * @returns {Object} Detailed compliance report
   */
  generateComplianceReport() {
    const allStatus = this.getAllComplianceStatus();
    
    const compliant = allStatus.filter(s => s.dpaExecuted);
    const nonCompliant = allStatus.filter(s => !s.dpaExecuted);
    const needsReview = allStatus.filter(s => s.needsReview && s.dpaExecuted);
    const required = allStatus.filter(s => s.required);
    const requiredCompliant = required.filter(s => s.dpaExecuted);

    return {
      summary: {
        total: allStatus.length,
        compliant: compliant.length,
        nonCompliant: nonCompliant.length,
        needsReview: needsReview.length,
        requiredServices: required.length,
        requiredCompliant: requiredCompliant.length
      },
      services: allStatus,
      actionItems: [
        ...nonCompliant.map(s => ({
          priority: s.required ? 'HIGH' : 'MEDIUM',
          service: s.service,
          action: `Execute DPA with ${s.service}`,
          contact: s.contactEmail,
          template: `/legal/dpa-templates/DPA-${s.id.toUpperCase()}.md`
        })),
        ...needsReview.map(s => ({
          priority: 'LOW',
          service: s.service,
          action: `Review DPA with ${s.service} (last reviewed: ${s.lastReviewed})`,
          contact: s.contactEmail
        }))
      ],
      generatedAt: new Date().toISOString()
    };
  }
}

export default new DPAComplianceService();
