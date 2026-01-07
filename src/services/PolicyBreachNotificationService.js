/**
 * Policy and Breach Notification Service
 * Handles sending notifications for policy changes, data breaches, and security incidents
 * Integrates with Resend email service
 */

import { supabase } from '../lib/supabase';
import ThirdPartyAuditService from './ThirdPartyAuditService';

class PolicyBreachNotificationService {
  constructor() {
    this.resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    this.fromEmail = import.meta.env.VITE_NOTIFICATION_FROM_EMAIL || 'notifications@yourdomain.com';
    this.supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@yourdomain.com';
    this.websiteUrl = import.meta.env.VITE_WEBSITE_URL || window.location.origin;
  }

  /**
   * Send privacy policy change notification to users
   * @param {string} policyVersionId - Policy version ID
   * @returns {Promise<Object>} Notification results
   */
  async notifyPolicyChange(policyVersionId) {
    try {
      // Get policy details
      const { data: policy, error: policyError } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('id', policyVersionId)
        .single();

      if (policyError || !policy) {
        throw new Error('Policy version not found');
      }

      // Get users who need notification
      const { data: users, error: usersError } = await supabase
        .rpc('get_users_for_policy_notification', {
          p_policy_type: policy.policy_type,
          p_policy_version_id: policyVersionId
        });

      if (usersError) {
        throw usersError;
      }

      // Filter users who have notifications enabled
      const usersToNotify = users.filter(u => u.notification_enabled);

      const results = {
        total: usersToNotify.length,
        sent: 0,
        failed: 0,
        errors: []
      };

      // Send notifications in batches
      for (const user of usersToNotify) {
        try {
          await this.sendPolicyChangeEmail(user, policy);
          await this.createPolicyChangeNotification(user.user_id, policy);
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId: user.user_id,
            email: user.email,
            error: error.message
          });
        }
      }

      // Mark policy as notified
      await supabase
        .from('policy_versions')
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString()
        })
        .eq('id', policyVersionId);

      return results;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Send data breach notification to affected users
   * @param {string} incidentId - Breach incident ID
   * @returns {Promise<Object>} Notification results
   */
  async notifyDataBreach(incidentId) {
    try {
      // Get incident details
      const { data: incident, error: incidentError } = await supabase
        .from('data_breach_incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (incidentError || !incident) {
        throw new Error('Breach incident not found');
      }

      // Get affected users
      const { data: users, error: usersError } = await supabase
        .rpc('get_users_for_breach_notification', {
          p_incident_id: incidentId
        });

      if (usersError) {
        throw usersError;
      }

      // Filter users who have breach notifications enabled
      const usersToNotify = users.filter(u => u.notification_enabled);

      const results = {
        total: usersToNotify.length,
        sent: 0,
        failed: 0,
        errors: []
      };

      // Send notifications
      for (const user of usersToNotify) {
        try {
          await this.sendBreachNotificationEmail(user, incident);
          await this.createBreachNotification(user.user_id, incident);
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId: user.user_id,
            email: user.email,
            error: error.message
          });
        }
      }

      // Mark incident as notified
      await supabase
        .from('data_breach_incidents')
        .update({
          users_notified: true,
          notification_sent_at: new Date().toISOString(),
          notification_method: 'both' // email + in-app
        })
        .eq('id', incidentId);

      return results;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Send policy change email via Resend
   * @param {Object} user - User object
   * @param {Object} policy - Policy version object
   */
  async sendPolicyChangeEmail(user, policy) {
    const policyName = policy.policy_type === 'privacy_policy' 
      ? 'Privacy Policy' 
      : 'Terms of Service';

    const subject = `Important: ${policyName} Update - Action Required`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${policyName} Updated</h1>
          </div>
          <div class="content">
            <p>Dear ${user.first_name || 'Valued Customer'},</p>
            
            <p>We are writing to inform you that we have updated our <strong>${policyName}</strong>.</p>
            
            <div class="highlight">
              <strong>What's Changed:</strong>
              <p>${policy.summary || 'We have made important updates to our policies.'}</p>
            </div>
            
            <p><strong>Effective Date:</strong> ${new Date(policy.effective_date).toLocaleDateString()}</p>
            
            <p><strong>What You Need to Do:</strong></p>
            <ul>
              <li>Review the updated ${policyName}</li>
              <li>Continue using our services indicates acceptance of the new terms</li>
              <li>Contact us if you have any questions or concerns</li>
            </ul>
            
            <a href="${this.websiteUrl}/legal/${policy.policy_type}" class="button">
              Review Updated ${policyName}
            </a>
            
            <p>If you do not agree with these changes, you may choose to discontinue using our services.</p>
            
            <p>Thank you for your continued trust.</p>
            
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>This is an important notification about changes to our policies.</p>
            <p>If you have questions, contact us at ${this.supportEmail}</p>
            <p><a href="${this.websiteUrl}/settings?tab=notifications">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html: htmlContent
    });

    // Log email sending to audit trail
    await ThirdPartyAuditService.logResendEmail(
      user.user_id,
      {
        type: 'policy_change',
        policyType: policy.policy_type,
        version: policy.version
      }
    );
  }

  /**
   * Send data breach notification email
   * @param {Object} user - User object
   * @param {Object} incident - Breach incident object
   */
  async sendBreachNotificationEmail(user, incident) {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };

    const subject = `🚨 URGENT: Security Incident Notification - ${incident.title}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${severityColors[incident.severity]}; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .alert { background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
          .info-box { background-color: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .action-box { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Security Incident Notification</h1>
            <p>Incident #${incident.incident_number}</p>
          </div>
          <div class="content">
            <p>Dear ${user.first_name || 'Valued Customer'},</p>
            
            <div class="alert">
              <strong>⚠️ IMPORTANT SECURITY NOTICE</strong>
              <p>We are writing to inform you of a security incident that may have affected your data.</p>
            </div>
            
            <h3>${incident.title}</h3>
            <p>${incident.description}</p>
            
            <div class="info-box">
              <strong>Incident Details:</strong>
              <ul>
                <li><strong>Severity:</strong> ${incident.severity.toUpperCase()}</li>
                <li><strong>Date of Incident:</strong> ${new Date(incident.breach_date).toLocaleDateString()}</li>
                <li><strong>Date Discovered:</strong> ${new Date(incident.discovered_date).toLocaleDateString()}</li>
                ${incident.contained_date ? `<li><strong>Date Contained:</strong> ${new Date(incident.contained_date).toLocaleDateString()}</li>` : ''}
              </ul>
            </div>
            
            ${incident.data_types_affected && incident.data_types_affected.length > 0 ? `
            <div class="alert">
              <strong>Data Types Potentially Affected:</strong>
              <ul>
                ${incident.data_types_affected.map(type => `<li>${type}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <h3>What We're Doing:</h3>
            <p>${incident.mitigation_steps || 'We have taken immediate steps to secure our systems and prevent further unauthorized access.'}</p>
            
            ${incident.user_actions_required ? `
            <div class="action-box">
              <strong>⚡ ACTIONS REQUIRED FROM YOU:</strong>
              <p>${incident.user_actions_required}</p>
            </div>
            ` : ''}
            
            <h3>What You Should Do:</h3>
            <ul>
              <li>Change your password immediately if you haven't already</li>
              <li>Enable two-factor authentication if available</li>
              <li>Monitor your account for any suspicious activity</li>
              <li>Be cautious of phishing attempts referencing this incident</li>
              <li>Review your privacy settings</li>
            </ul>
            
            <a href="${this.websiteUrl}/settings?tab=security" class="button">
              Review Security Settings
            </a>
            
            <h3>How to Contact Us:</h3>
            <p>If you have questions or concerns about this incident, please contact our support team:</p>
            <p><strong>Email:</strong> ${incident.support_contact || this.supportEmail}</p>
            <p><strong>Reference:</strong> Incident #${incident.incident_number}</p>
            
            <p>We sincerely apologize for any inconvenience this may cause and appreciate your understanding.</p>
            
            <p>Best regards,<br>The Security Team</p>
          </div>
          <div class="footer">
            <p>This is a mandatory security notification and cannot be unsubscribed from.</p>
            <p>Incident Reference: #${incident.incident_number}</p>
            <p>© ${new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
      tags: [
        { name: 'type', value: 'security_breach' },
        { name: 'severity', value: incident.severity },
        { name: 'incident', value: incident.incident_number }
      ]
    });

    // Log email sending to audit trail
    await ThirdPartyAuditService.logResendEmail(
      user.user_id,
      {
        type: 'data_breach',
        incidentId: incident.id,
        incidentNumber: incident.incident_number,
        severity: incident.severity
      }
    );
  }

  /**
   * Create in-app policy change notification
   * @param {string} userId - User ID
   * @param {Object} policy - Policy version object
   */
  async createPolicyChangeNotification(userId, policy) {
    const policyName = policy.policy_type === 'privacy_policy' 
      ? 'Privacy Policy' 
      : 'Terms of Service';

    await supabase.from('policy_change_notifications').insert({
      policy_version_id: policy.id,
      user_id: userId,
      subject: `${policyName} Updated`,
      message: `Our ${policyName} has been updated. Please review the changes.`,
      changes_summary: policy.summary,
      delivery_method: 'both'
    });
  }

  /**
   * Create in-app breach notification
   * @param {string} userId - User ID
   * @param {Object} incident - Breach incident object
   */
  async createBreachNotification(userId, incident) {
    await supabase.from('security_incident_notifications').insert({
      incident_id: incident.id,
      user_id: userId,
      notification_type: 'data_breach',
      subject: `Security Incident: ${incident.title}`,
      message: incident.description,
      severity: incident.severity,
      delivery_method: 'both'
    });
  }

  /**
   * Send email via Resend API
   * @param {Object} emailData - Email data (to, subject, html, tags)
   */
  async sendEmail(emailData) {
    if (!this.resendApiKey) {
      return { success: false, reason: 'API key not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendApiKey}`
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          tags: emailData.tags || []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      const result = await response.json();
      return { success: true, id: result.id };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread security notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Unread notifications
   */
  async getUnreadSecurityNotifications(userId) {
    const { data, error } = await supabase
      .from('security_incident_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('in_app_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  /**
   * Get unread policy notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Unread notifications
   */
  async getUnreadPolicyNotifications(userId) {
    const { data, error } = await supabase
      .from('policy_change_notifications')
      .select(`
        *,
        policy_versions (
          policy_type,
          version,
          title,
          effective_date
        )
      `)
      .eq('user_id', userId)
      .eq('in_app_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} type - Notification type ('policy' or 'security')
   */
  async markNotificationAsRead(notificationId, type) {
    const functionName = type === 'policy' 
      ? 'mark_policy_notification_read' 
      : 'mark_security_notification_read';

    const { data, error } = await supabase.rpc(functionName, {
      p_notification_id: notificationId
    });

    if (error) {
      throw error;
    }

    return data;
  }
}

export default new PolicyBreachNotificationService();
