import { supabase } from '../lib/supabase';

/**
 * OrderService - Order Management for Ecommerce App
 * 
 * Features:
 * - Create orders from cart
 * - Get user orders
 * - Get order details
 * - Update order status (cancel)
 * - Manage shipping addresses
 */

class OrderService {
  
  /**
   * Create order from cart
   * @param {Object} orderData - { delivery_type, shipping_address_id, customer_notes, payment_method, voucher }
   * @returns {Object} { data: { order_id, order_number, payment_id, transaction_id, total }, error }
   */
  async createOrder({ delivery_type, shipping_address_id, customer_notes, payment_method, voucher = null }) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Validate required fields
      if (!delivery_type) {
        return { data: null, error: 'Delivery type is required' };
      }

      if (!payment_method) {
        return { data: null, error: 'Payment method is required' };
      }

      // If local delivery, shipping address is required
      if (delivery_type === 'local_delivery' && !shipping_address_id) {
        return { data: null, error: 'Shipping address is required for local delivery' };
      }

      // Prepare voucher parameters
      const voucherParams = voucher ? {
        p_voucher_id: voucher.voucherId,
        p_voucher_code: voucher.code,
        p_voucher_discount: voucher.discountAmount
      } : {
        p_voucher_id: null,
        p_voucher_code: null,
        p_voucher_discount: 0
      };

      // Call database function to create order from cart
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: user.id,
        p_delivery_type: delivery_type,
        p_shipping_address_id: shipping_address_id,
        p_customer_notes: customer_notes || null,
        p_payment_method: payment_method,
        ...voucherParams
      });

      if (error) {
        console.error('Error creating order:', error);
        return { data: null, error: error.message };
      }

      // The function returns an array with one object
      const orderData = data[0];

      return { data: orderData, error: null };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all orders for current user
   * @returns {Object} { data: orders[], error }
   */
  async getUserOrders() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            variant_name,
            quantity,
            unit_price,
            subtotal,
            discount,
            total
          ),
          payments (
            id,
            transaction_id,
            payment_method,
            amount,
            payment_status,
            created_at,
            paid_at
          ),
          shipping_addresses (
            id,
            full_name,
            phone,
            email,
            street_address,
            city,
            province,
            postal_code,
            country
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get single order by ID
   * @param {string} orderId - Order UUID
   * @returns {Object} { data: order, error }
   */
  async getOrderById(orderId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            variant_name,
            quantity,
            unit_price,
            subtotal,
            discount,
            total
          ),
          payments (
            id,
            transaction_id,
            payment_method,
            amount,
            payment_status,
            card_last_four,
            card_type,
            gcash_reference,
            gcash_phone,
            created_at,
            paid_at
          ),
          shipping_addresses (
            id,
            full_name,
            phone,
            email,
            street_address,
            city,
            province,
            postal_code,
            country
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Cancel an order (only if status is pending)
   * @param {string} orderId - Order UUID
   * @returns {Object} { data, error }
   */
  async cancelOrder(orderId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // First check if order can be cancelled
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        return { data: null, error: 'Order not found' };
      }

      if (order.status !== 'pending') {
        return { data: null, error: 'Only pending orders can be cancelled' };
      }

      // Update order status
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling order:', error);
        return { data: null, error: error.message };
      }

      // Also update payment status
      await supabase
        .from('payments')
        .update({ payment_status: 'cancelled' })
        .eq('order_id', orderId);

      return { data, error: null };
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get or create default shipping address
   * @returns {Object} { data: address, error }
   */
  async getDefaultAddress() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getDefaultAddress:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all shipping addresses for user
   * @returns {Object} { data: addresses[], error }
   */
  async getShippingAddresses() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getShippingAddresses:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create shipping address
   * @param {Object} addressData - Address fields
   * @returns {Object} { data: address, error }
   */
  async createShippingAddress(addressData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // If this is set as default, unset other defaults
      if (addressData.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
          ...addressData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating address:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createShippingAddress:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update shipping address
   * @param {string} addressId - Address UUID
   * @param {Object} addressData - Updated address fields
   * @returns {Object} { data: address, error }
   */
  async updateShippingAddress(addressId, addressData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // If this is set as default, unset other defaults
      if (addressData.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', addressId);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating address:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateShippingAddress:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete shipping address
   * @param {string} addressId - Address UUID
   * @returns {Object} { data, error }
   */
  async deleteShippingAddress(addressId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting address:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in deleteShippingAddress:', error);
      return { data: null, error: error.message };
    }
  }
}

export default new OrderService();
