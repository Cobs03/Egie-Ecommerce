import { supabase } from '../lib/supabase';

/**
 * Service for handling contact form submissions
 */
class ContactService {
  /**
   * Submit a contact form to the database
   * @param {Object} formData - The form data to submit
   * @param {string} formData.name - Contact's name
   * @param {string} formData.email - Contact's email
   * @param {string} formData.message - Contact's message
   * @param {string} formData.phone - Contact's phone (optional)
   * @param {boolean} formData.acceptTerms - Terms acceptance
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async submitContactForm(formData) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            message: formData.message.trim(),
            phone: formData.phone?.trim() || null,
            accepted_terms: formData.acceptTerms,
            status: 'new'
          }
        ])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to submit contact form'
        };
      }

      return {
        success: true,
        data,
        message: 'Your message has been sent successfully! We\'ll get back to you soon.'
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.'
      };
    }
  }

  /**
   * Get all contact submissions (Admin only)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status (new, read, replied, archived)
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async getContactSubmissions(filters = {}) {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to fetch contact submissions'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Update contact submission status (Admin only)
   * @param {string} id - Submission ID
   * @param {string} status - New status (new, read, replied, archived)
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async updateSubmissionStatus(id, status, adminNotes = null) {
    try {
      const updateData = { status };
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'replied') {
        updateData.replied_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to update submission status'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get contact submission statistics (Admin only)
   * @returns {Promise<Object>} Result with success status and statistics
   */
  static async getSubmissionStats() {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('status, created_at');

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to fetch statistics'
        };
      }

      const stats = {
        total: data.length,
        new: data.filter(item => item.status === 'new').length,
        read: data.filter(item => item.status === 'read').length,
        replied: data.filter(item => item.status === 'replied').length,
        archived: data.filter(item => item.status === 'archived').length,
        today: data.filter(item => {
          const today = new Date().setHours(0, 0, 0, 0);
          const itemDate = new Date(item.created_at).setHours(0, 0, 0, 0);
          return itemDate === today;
        }).length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}

export default ContactService;
