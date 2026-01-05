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

      // Pseudonymize user ID for privacy
      const anonymousUserId = userId ? pseudonymizeUserId(userId) : null;

      const viewData = {
        product_id: productId,
        user_id: anonymousUserId, // Store pseudonymized ID instead of real ID
        session_id: sessionId
      };

      const { data, error } = await supabase
        .from('product_views')
        .insert(viewData)
        .select();

      if (error) {
        console.error('Error tracking view:', sanitizeLogData(error));
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error tracking product view:', sanitizeLogData(error));
      return { success: false, error: error.message };
    }
  }
}

export default ProductAnalyticsService;
