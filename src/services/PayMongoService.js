/**
 * PayMongo Payment Gateway Service
 * Handles GCash and other payment methods through PayMongo API
 */

const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Debug: Log keys on service initialization (will show in console)
console.log('Secret Key loaded:', PAYMONGO_SECRET_KEY ? `${PAYMONGO_SECRET_KEY.substring(0, 15)}...` : 'NOT FOUND');
console.log('Public Key loaded:', PAYMONGO_PUBLIC_KEY ? `${PAYMONGO_PUBLIC_KEY.substring(0, 15)}...` : 'NOT FOUND');

class PayMongoService {
  /**
   * Create a payment intent for card, GCash, or other payment methods
   * @param {number} amount - Amount in pesos (will be converted to centavos)
   * @param {string} description - Payment description
   * @param {array} paymentMethods - Array of allowed payment methods (e.g., ['card', 'gcash', 'paymaya'])
   * @param {object} metadata - Additional order metadata
   * @returns {Promise<object>} Payment intent data
   */
  async createPaymentIntent(amount, description, paymentMethods = ['card'], metadata = {}) {
    try {
      // Convert amount to centavos (PayMongo requires amount in smallest currency unit)
      const amountInCentavos = Math.round(amount * 100);

      const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCentavos,
              payment_method_allowed: paymentMethods,
              payment_method_options: {
                card: {
                  request_three_d_secure: 'any'
                }
              },
              currency: 'PHP',
              description: description,
              statement_descriptor: 'Egie GameShop',
              metadata: metadata
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to create payment intent');
      }

      const data = await response.json();
      return {
        success: true,
        paymentIntent: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a card payment method
   * @param {object} cardDetails - Card details {number, exp_month, exp_year, cvc}
   * @param {object} billing - Billing details {name, email, phone, address}
   * @returns {Promise<object>} Payment method data
   */
  async createCardPaymentMethod(cardDetails, billing) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'card',
              details: {
                card_number: cardDetails.number.replace(/\s/g, ''),
                exp_month: parseInt(cardDetails.exp_month),
                exp_year: parseInt(cardDetails.exp_year),
                cvc: cardDetails.cvc
              },
              billing: {
                name: billing.name,
                email: billing.email,
                phone: billing.phone,
                address: {
                  line1: billing.address.line1,
                  line2: billing.address.line2 || '',
                  city: billing.address.city,
                  state: billing.address.state,
                  postal_code: billing.address.postal_code,
                  country: 'PH'
                }
              }
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to create card payment method');
      }

      const data = await response.json();
      return {
        success: true,
        paymentMethod: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a payment method for GCash, PayMaya, or other e-wallets
   * @param {string} type - Payment method type (gcash, paymaya, card)
   * @param {object} details - Payment method details
   * @returns {Promise<object>} Payment method data
   */
  async createPaymentMethod(type, details = {}) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: type,
              ...details
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to create payment method');
      }

      const data = await response.json();
      return {
        success: true,
        paymentMethod: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Attach payment method to payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @param {string} paymentMethodId - Payment method ID
   * @param {string} returnUrl - URL to return after payment
   * @returns {Promise<object>} Attached payment intent
   */
  async attachPaymentIntent(paymentIntentId, paymentMethodId, returnUrl) {
    try {
      const response = await fetch(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
          },
          body: JSON.stringify({
            data: {
              attributes: {
                payment_method: paymentMethodId,
                client_key: paymentIntentId,
                return_url: returnUrl
              }
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to attach payment method');
      }

      const data = await response.json();
      return {
        success: true,
        paymentIntent: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve payment intent status
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<object>} Payment intent data
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const response = await fetch(
        `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to retrieve payment intent');
      }

      const data = await response.json();
      return {
        success: true,
        paymentIntent: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a GCash payment source (alternative to payment intent)
   * @param {number} amount - Amount in pesos
   * @param {object} billing - Billing details
   * @param {string} redirectUrl - Success/failed redirect URL
   * @returns {Promise<object>} Payment source data
   */
  async createGCashSource(amount, billing, redirectUrl) {
    try {
      // Debug: Check what key is being used
      console.log('Using secret key:', PAYMONGO_SECRET_KEY ? `${PAYMONGO_SECRET_KEY.substring(0, 20)}...` : 'UNDEFINED');
      const authString = `${PAYMONGO_SECRET_KEY}:`;
      const encodedAuth = btoa(authString);
      console.log('Auth string to encode:', `${authString.substring(0, 25)}...`);
      console.log('Encoded auth (first 30 chars):', encodedAuth.substring(0, 30));

      const amountInCentavos = Math.round(amount * 100);

      const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${encodedAuth}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCentavos,
              redirect: {
                success: redirectUrl.success,
                failed: redirectUrl.failed
              },
              type: 'gcash',
              currency: 'PHP',
              billing: billing
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to create GCash source');
      }

      const data = await response.json();
      return {
        success: true,
        source: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a payment (charge) from a source
   * @param {number} amount - Amount in pesos
   * @param {string} sourceId - Source ID
   * @param {string} description - Payment description
   * @returns {Promise<object>} Payment data
   */
  async createPayment(amount, sourceId, description) {
    try {
      const amountInCentavos = Math.round(amount * 100);

      const response = await fetch(`${PAYMONGO_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCentavos,
              source: {
                id: sourceId,
                type: 'source'
              },
              currency: 'PHP',
              description: description
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to create payment');
      }

      const data = await response.json();
      return {
        success: true,
        payment: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve a source to check its status
   * @param {string} sourceId - Source ID
   * @returns {Promise<object>} Source data
   */
  async getSource(sourceId) {
    try {
      const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to retrieve source');
      }

      const data = await response.json();
      return {
        success: true,
        source: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PayMongoService();
