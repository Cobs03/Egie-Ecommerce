/**
 * PayMongo Edge Function Service
 * Secure server-side PayMongo integration via Supabase Edge Functions
 * This keeps the secret key safe on the server, never exposed to frontend
 */

import { supabase } from '../lib/supabase';
import ThirdPartyAuditService from './ThirdPartyAuditService';
import PrivacyUtils from '../utils/PrivacyUtils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

class PayMongoEdgeFunctionService {
  /**
   * Create a GCash payment source via Edge Function
   * @param {number} amount - Amount in pesos
   * @param {object} billing - Billing details
   * @param {object} redirect - Success/failed redirect URLs
   * @returns {Promise<object>} Payment source data
   */
  async createGCashSource(amount, billing, redirect, userId = null) {
    try {
      // Verify user consent for payment processing
      if (userId) {
        const hasConsent = await this.verifyPaymentConsent(userId);
        if (!hasConsent) {
          throw new Error('User has not consented to payment processing. Please update your consent preferences.');
        }
      }

      // Apply data minimization - mask sensitive billing info
      const sanitizedBilling = {
        name: billing.name,
        email: PrivacyUtils.maskEmail(billing.email),
        phone: PrivacyUtils.maskPhone(billing.phone),
        address: {
          line1: billing.address?.line1,
          city: billing.address?.city,
          state: billing.address?.state,
          postal_code: billing.address?.postal_code,
          country: billing.address?.country
        }
      };

      const { data, error } = await supabase.functions.invoke('create-gcash-source', {
        body: {
          amount,
          billing,
          redirect
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create GCash source');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create GCash source');
      }

      // Log third-party data sharing
      if (userId) {
        await ThirdPartyAuditService.logPayMongoTransaction(
          userId,
          'gcash_source_creation',
          {
            sourceId: data.source.id,
            amount: amount,
            currency: 'PHP',
            method: 'gcash'
          },
          sanitizedBilling
        );
      }

      return {
        success: true,
        source: data.source,
        checkoutUrl: data.source.attributes.redirect.checkout_url
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a payment from a source via Edge Function
   * @param {number} amount - Amount in pesos
   * @param {string} sourceId - Source ID
   * @param {string} description - Payment description
   * @returns {Promise<object>} Payment data
   */
  async createPayment(amount, sourceId, description, userId = null) {
    try {
      // Verify user consent for payment processing
      if (userId) {
        const hasConsent = await this.verifyPaymentConsent(userId);
        if (!hasConsent) {
          throw new Error('User has not consented to payment processing. Please update your consent preferences.');
        }
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          sourceId,
          description
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Log third-party data sharing
      if (userId) {
        await ThirdPartyAuditService.logPayMongoTransaction(
          userId,
          'payment_creation',
          {
            paymentId: data.payment.id,
            sourceId: sourceId,
            amount: amount,
            currency: 'PHP',
            description: description
          },
          { description: description }
        );
      }

      return {
        success: true,
        payment: data.payment
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process card payment via Edge Function
   * @param {object} cardDetails - Card details {number, exp_month, exp_year, cvc}
   * @param {object} billing - Billing details
   * @param {number} amount - Amount in pesos
   * @param {string} description - Payment description
   * @param {object} metadata - Additional metadata
   * @param {string} returnUrl - URL to return after 3DS
   * @param {string} userId - User ID for consent and audit logging
   * @returns {Promise<object>} Payment intent data
   */
  async processCardPayment(cardDetails, billing, amount, description, metadata = {}, returnUrl = null, userId = null) {
    try {
      // Verify user consent for payment processing
      if (userId) {
        const hasConsent = await this.verifyPaymentConsent(userId);
        if (!hasConsent) {
          throw new Error('User has not consented to payment processing. Please update your consent preferences.');
        }
      }

      console.log('Card Details:', { 
        number: cardDetails.number.substring(0, 4) + '****', 
        exp_month: cardDetails.exp_month,
        exp_year: cardDetails.exp_year 
      });
      const response = await supabase.functions.invoke('process-card-payment', {
        body: {
          cardDetails,
          billing,
          amount,
          description,
          metadata,
          returnUrl
        }
      });

      // If there's an error from Supabase Functions
      if (response.error) {
        // Try to extract error message from response body
        let errorMessage = 'Failed to process card payment';
        
        // Check if there's a response with body
        if (response.response) {
          try {
            const responseBody = await response.response.json();
            if (responseBody.error) {
              errorMessage = responseBody.error;
            }
          } catch (e) {
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = response.data;

      // If the function returned but with an error
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to process card payment');
      }

      // Log third-party data sharing
      if (userId) {
        await ThirdPartyAuditService.logPayMongoTransaction(
          userId,
          'card_payment',
          {
            paymentIntentId: data.paymentIntent.id,
            amount: amount,
            currency: 'PHP',
            requires3DS: data.requires3DS,
            cardBrand: cardDetails.number ? 'card' : 'unknown',
            description: description
          },
          {
            name: billing.name,
            email: PrivacyUtils.maskEmail(billing.email),
            phone: PrivacyUtils.maskPhone(billing.phone),
            address: billing.address
          }
        );
      }

      return {
        success: true,
        paymentIntent: data.paymentIntent,
        requires3DS: data.requires3DS,
        redirectUrl: data.redirectUrl
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get source status via Edge Function
   * @param {string} sourceId - Source ID
   * @returns {Promise<object>} Source data
   */
  async getSource(sourceId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-source-status', {
        body: { sourceId }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get source status');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get source status');
      }

      return {
        success: true,
        source: data.source
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify user consent for payment processing
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Whether user has consented
   */
  async verifyPaymentConsent(userId) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('payment_processing')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // If no consent record, assume consent (backward compatibility)
        // In production, you might want to require explicit consent
        return true;
      }

      return data.payment_processing === true;
    } catch (error) {
      // Fail open for backward compatibility
      return true;
    }
  }
}

export default new PayMongoEdgeFunctionService();
