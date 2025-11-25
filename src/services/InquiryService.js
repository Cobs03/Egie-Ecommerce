import { supabase } from '../lib/supabase.js';

/**
 * InquiryService - Handle product inquiries for customers
 */
class InquiryService {
  /**
   * Create a new inquiry about a product
   * @param {Object} inquiryData - { product_id, subject, question }
   * @returns {Object} { data, error }
   */
  async createInquiry({ product_id, subject, question }) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to ask a question');
      }

      // Insert inquiry
      const { data, error } = await supabase
        .from('product_inquiries')
        .insert({
          product_id,
          user_id: user.id,
          subject,
          question,
          status: 'pending',
          priority: 'normal'
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating inquiry:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get user's own inquiries
   * @returns {Object} { data, error }
   */
  async getMyInquiries() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in');
      }

      // Get user's inquiries
      const { data: inquiries, error } = await supabase
        .from('product_inquiries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data
      if (inquiries && inquiries.length > 0) {
        // Get product details
        const productIds = [...new Set(inquiries.map(i => i.product_id))];
        const { data: products } = await supabase
          .from('products')
          .select('id, name, images')
          .in('id', productIds);

        const productsMap = {};
        products?.forEach(p => {
          productsMap[p.id] = p;
        });

        // Get reply counts
        const inquiryIds = inquiries.map(i => i.id);
        const { data: replyCounts } = await supabase
          .from('inquiry_replies')
          .select('inquiry_id')
          .in('inquiry_id', inquiryIds);

        // Get unread counts
        const { data: unreadCounts } = await supabase
          .from('inquiry_unread_counts')
          .select('inquiry_id, unread_by_staff, unread_by_customer')
          .in('inquiry_id', inquiryIds);

        const replyCountsMap = {};
        replyCounts?.forEach(r => {
          replyCountsMap[r.inquiry_id] = (replyCountsMap[r.inquiry_id] || 0) + 1;
        });

        const unreadCountsMap = {};
        unreadCounts?.forEach(u => {
          unreadCountsMap[u.inquiry_id] = {
            unread_by_staff: u.unread_by_staff,
            unread_by_customer: u.unread_by_customer
          };
        });

        // Attach to inquiries
        inquiries.forEach(inquiry => {
          inquiry.product = productsMap[inquiry.product_id] || null;
          inquiry.reply_count = replyCountsMap[inquiry.id] || 0;
          inquiry.unread_by_customer = unreadCountsMap[inquiry.id]?.unread_by_customer || 0;
          inquiry.has_new_replies = inquiry.unread_by_customer > 0;
        });
      }

      return { data: inquiries || [], error: null };
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get single inquiry with all replies
   * @param {string} inquiry_id - Inquiry ID
   * @returns {Object} { data, error }
   */
  async getInquiryWithReplies(inquiry_id) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in');
      }

      // Get inquiry (will check RLS that user owns it)
      const { data: inquiry, error: inquiryError } = await supabase
        .from('product_inquiries')
        .select('*')
        .eq('id', inquiry_id)
        .eq('user_id', user.id) // Ensure user owns the inquiry
        .single();

      if (inquiryError) throw inquiryError;

      // Get product
      const { data: product } = await supabase
        .from('products')
        .select('id, name, images, price')
        .eq('id', inquiry.product_id)
        .single();

      inquiry.product = product;

      // Get all replies
      const { data: replies, error: repliesError } = await supabase
        .from('inquiry_replies')
        .select('*')
        .eq('inquiry_id', inquiry_id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Get user info for each reply
      if (replies && replies.length > 0) {
        const replyUserIds = [...new Set(replies.map(r => r.user_id))];
        const { data: replyUsers } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, role')
          .in('id', replyUserIds);

        const usersMap = {};
        replyUsers?.forEach(u => {
          usersMap[u.id] = u;
        });

        replies.forEach(reply => {
          reply.user = usersMap[reply.user_id] || null;
        });
      }

      inquiry.replies = replies || [];

      return { data: inquiry, error: null };
    } catch (error) {
      console.error('Error fetching inquiry with replies:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Add a reply to own inquiry (customer follow-up)
   * @param {string} inquiry_id - Inquiry ID
   * @param {string} reply_text - Reply text
   * @returns {Object} { data, error }
   */
  async addReply(inquiry_id, reply_text) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in');
      }

      // Insert reply
      const { data: reply, error } = await supabase
        .from('inquiry_replies')
        .insert({
          inquiry_id,
          user_id: user.id,
          reply_text,
          is_admin_reply: false
        })
        .select()
        .single();

      if (error) throw error;

      return { data: reply, error: null };
    } catch (error) {
      console.error('Error adding reply:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Mark inquiry as read (update status if needed)
   * @param {string} inquiry_id - Inquiry ID
   * @returns {Object} { error }
   */
  async markAsRead(inquiry_id) {
    try {
      // No need to update anything, just for potential future use
      return { error: null };
    } catch (error) {
      console.error('Error marking as read:', error);
      return { error: error.message };
    }
  }

  /**
   * Mark all staff replies in an inquiry as read by customer
   * @param {string} inquiry_id - Inquiry ID
   * @returns {Object} { error }
   */
  async markRepliesAsReadByCustomer(inquiry_id) {
    try {
      const { error } = await supabase
        .from('inquiry_replies')
        .update({ read_by_customer: true })
        .eq('inquiry_id', inquiry_id)
        .eq('is_admin_reply', true) // Only mark staff replies
        .eq('read_by_customer', false); // Only unread ones

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error marking replies as read by customer:', error);
      return { error: error.message };
    }
  }

  /**
   * Get unread reply count for customer (admin replies not yet read)
   * @returns {Object} { count, error }
   */
  async getUnreadCount() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { count: 0, error: null };
      }

      // Get customer's inquiry IDs
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('product_inquiries')
        .select('id')
        .eq('user_id', user.id);

      if (inquiriesError) throw inquiriesError;

      const inquiryIds = inquiries.map(i => i.id);

      if (inquiryIds.length === 0) {
        return { count: 0, error: null };
      }

      // Count unread admin replies
      const { count, error } = await supabase
        .from('inquiry_replies')
        .select('*', { count: 'exact', head: true })
        .in('inquiry_id', inquiryIds)
        .eq('is_admin_reply', true)
        .eq('read_by_customer', false);

      if (error) throw error;

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { count: 0, error: error.message };
    }
  }
}

export default new InquiryService();
