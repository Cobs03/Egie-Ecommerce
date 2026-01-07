import { supabase } from '../lib/supabase';
import { pseudonymizeUserId, sanitizeLogData } from '../utils/PrivacyUtils';

class NotificationService {
  /**
   * Get user notifications
   * @param {string} category - 'order_update' or 'promotion' or null for all
   * @param {boolean} isRead - filter by read status (null for all)
   * @param {number} limit - number of notifications to fetch
   * @returns {Promise<{data: Array, error: string|null}>}
   */
  async getUserNotifications(category = null, isRead = null, limit = 50) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_user_notifications', {
        p_user_id: user.id,
        p_category: category,
        p_is_read: isRead,
        p_limit: limit
      });

      if (error) {
        console.error('RPC error:', sanitizeLogData(error));
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching notifications:', sanitizeLogData(error));
      return { data: [], error: error.message };
    }
  }

  /**
   * Get unread notification count
   * @param {string} category - 'order_update' or 'promotion' or null for all
   * @returns {Promise<{count: number, error: string|null}>}
   */
  async getUnreadCount(category = null) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { count: 0, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.id,
        p_category: category
      });

      if (error) throw error;

      return { count: data || 0, error: null };
    } catch (error) {
      console.error('Error fetching unread count:', sanitizeLogData(error));
      return { count: 0, error: error.message };
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - UUID of the notification
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async markAsRead(notificationId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('mark_notification_as_read', {
        p_notification_id: notificationId,
        p_user_id: user.id
      });

      if (error) throw error;

      return { success: data, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} category - 'order_update' or 'promotion' or null for all
   * @returns {Promise<{count: number, error: string|null}>}
   */
  async markAllAsRead(category = null) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { count: 0, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
        p_user_id: user.id,
        p_category: category
      });

      if (error) throw error;

      return { count: data || 0, error: null };
    } catch (error) {
      return { count: 0, error: error.message };
    }
  }

  /**
   * Subscribe to real-time notification updates
   * @param {Function} callback - Function to call when notifications change
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribeToNotifications(callback) {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }

  /**
   * Send promotion notification (Admin only)
   * @param {Object} params - Notification parameters
   * @returns {Promise<{count: number, error: string|null}>}
   */
  async sendPromotionNotification({
    title,
    message,
    voucherId = null,
    discountId = null,
    actionType = null,
    actionData = null,
    targetUsers = 'all' // 'all', 'new', 'existing'
  }) {
    try {
      const { data, error } = await supabase.rpc('create_promotion_notification', {
        p_title: title,
        p_message: message,
        p_voucher_id: voucherId,
        p_discount_id: discountId,
        p_action_type: actionType,
        p_action_data: actionData,
        p_target_users: targetUsers
      });

      if (error) throw error;

      return { count: data, error: null };
    } catch (error) {
      return { count: 0, error: error.message };
    }
  }

  /**
   * Format notification time (e.g., "5m", "2h", "3d")
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}hr`;
    if (diffDays < 7) return `${diffDays}d`;
    
    // More than 7 days, show date
    return notificationTime.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  }

  /**
   * Get notification icon based on type
   * @param {string} type - Notification type
   * @returns {string} Icon name or component
   */
  getNotificationIcon(type) {
    const iconMap = {
      'order_placed': 'package',
      'order_confirmed': 'check-circle',
      'order_processing': 'clock',
      'order_shipped': 'truck',
      'order_ready_for_pickup': 'store',
      'order_delivered': 'check-circle',
      'order_cancelled': 'x-circle',
      'promotion': 'tag',
      'discount': 'percent',
      'voucher': 'ticket',
      'system': 'bell'
    };

    return iconMap[type] || 'bell';
  }
}

// Export singleton instance
const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;
