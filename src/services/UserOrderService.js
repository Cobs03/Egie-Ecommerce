import { supabase } from '../lib/supabase';

export class UserOrderService {
  // Get all orders for the current logged-in user
  static async getUserOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
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
          payments(*),
          shipping_addresses(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get specific order by ID for current user
  static async getOrderById(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
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
          payments(*),
          shipping_addresses(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Mark order as received (customer confirms delivery)
  static async markOrderReceived(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error} = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Cancel order (only if status is pending, confirmed, or processing)
  static async cancelOrder(orderId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      // First check if order can be cancelled
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      const cancellableStatuses = ['pending', 'confirmed', 'processing'];
      if (!cancellableStatuses.includes(order?.status)) {
        return { data: null, error: 'Order cannot be cancelled. It has already been shipped.' };
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          order_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Also cancel the payment
      await supabase
        .from('payments')
        .update({ payment_status: 'cancelled' })
        .eq('order_id', orderId);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}
