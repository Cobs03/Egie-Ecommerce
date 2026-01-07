import { supabase } from '../lib/supabase';

/**
 * VoucherService - Customer-facing voucher management
 * Handles voucher validation and application at checkout
 */
class VoucherService {
  /**
   * Validate voucher code for current user
   * @param {string} voucherCode - The voucher code to validate
   * @param {number} cartTotal - Current cart total (subtotal before shipping)
   * @returns {Object} { success, data: { valid, message, voucherId, discountAmount, discountType, voucherValue }, error }
   */
  async validateVoucher(voucherCode, cartTotal) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { 
          success: false, 
          data: null, 
          error: 'Please login to use vouchers' 
        };
      }

      // Call database function to validate voucher
      const { data, error } = await supabase.rpc('validate_voucher_for_user', {
        p_voucher_code: voucherCode.toUpperCase(),
        p_user_id: user.id,
        p_cart_total: cartTotal
      });

      if (error) {
        return { 
          success: false, 
          data: null, 
          error: error.message 
        };
      }

      // The function returns an array with one result
      const result = data[0];
      
      return { 
        success: result.valid, 
        data: {
          valid: result.valid,
          message: result.message,
          voucherId: result.voucher_id,
          discountAmount: result.discount_amount,
          discountType: result.discount_type,
          voucherValue: result.voucher_value
        },
        error: result.valid ? null : result.message 
      };
    } catch (error) {
      return { 
        success: false, 
        data: null, 
        error: error.message || 'Failed to validate voucher' 
      };
    }
  }

  /**
   * Get all active vouchers (for display purposes)
   * @returns {Object} { success, data: vouchers[], error }
   */
  async getActiveVouchers() {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  /**
   * Get voucher by code (for preview/info)
   * @param {string} voucherCode
   * @returns {Object} { success, data: voucher, error }
   */
  async getVoucherByCode(voucherCode) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        return { success: false, data: null, error: 'Voucher not found' };
      }

      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  /**
   * Get user's voucher usage history
   * @returns {Object} { success, data: usage[], error }
   */
  async getUserVoucherUsage() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('voucher_usage')
        .select(`
          *,
          voucher:voucher_id (
            id,
            name,
            code,
            price,
            discount_type
          ),
          order:order_id (
            id,
            order_number,
            status,
            created_at
          )
        `)
        .eq('customer_id', user.id)
        .order('used_at', { ascending: false });

      if (error) {
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  /**
   * Calculate discount amount based on voucher type
   * @param {Object} voucher - The voucher object
   * @param {number} cartTotal - The cart total
   * @returns {number} The discount amount
   */
  calculateDiscountAmount(voucher, cartTotal) {
    if (!voucher || !voucher.price) return 0;

    if (voucher.discount_type === 'percent') {
      return Math.round(cartTotal * (voucher.price / 100) * 100) / 100;
    } else {
      // Fixed amount - don't let it exceed cart total
      return Math.min(voucher.price, cartTotal);
    }
  }

  /**
   * Format voucher value for display
   * @param {Object} voucher - The voucher object
   * @returns {string} Formatted value (e.g., "₱50" or "10%")
   */
  formatVoucherValue(voucher) {
    if (!voucher || !voucher.price) return '';

    if (voucher.discount_type === 'percent') {
      return `${voucher.price}%`;
    } else {
      return `₱${voucher.price.toLocaleString()}`;
    }
  }
}

export default new VoucherService();
