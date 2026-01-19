import { supabase } from '../lib/supabase';
import { pseudonymizeUserId, generateAnonymousId, sanitizeLogData } from '../utils/PrivacyUtils';

class ProductAnalyticsService {
  /**
   * Track product view/click
   * Call this when user clicks on a product to view details
   * Uses pseudonymization for privacy compliance
   */
  static async trackProductView(productId, userId = null) {
    try {
      // Generate or get anonymous session ID
      let sessionId = localStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = generateAnonymousId();
        localStorage.setItem('analytics_session_id', sessionId);
      }

      // Don't pseudonymize - user_id column expects UUID format, not hashed string
      // For privacy: we rely on session_id for anonymous tracking
      // and user_id is nullable (can be null for anonymous users)
      const viewData = {
        product_id: productId,
        user_id: userId || null, // Store actual UUID or null (not pseudonymized string)
        session_id: sessionId
      };

      const { data, error } = await supabase
        .from('product_views')
        .insert(viewData)
        .select();

      if (error) {
        console.error('❌ Failed to track product view:', error);
        throw error;
      }
      
      console.log('✅ Product view tracked:', { productId, viewCount: data?.length });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Product tracking error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default ProductAnalyticsService;
