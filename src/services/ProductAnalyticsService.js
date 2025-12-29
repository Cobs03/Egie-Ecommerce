import { supabase } from '../lib/supabase';

class ProductAnalyticsService {
  /**
   * Track product view/click
   * Call this when user clicks on a product to view details
   */
  static async trackProductView(productId, userId = null) {
    try {
      console.log('📊 Tracking product view:', { productId, userId });
      
      // Generate or get session ID for anonymous tracking
      let sessionId = localStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('analytics_session_id', sessionId);
        console.log('🆕 Created new session ID:', sessionId);
      }

      const viewData = {
        product_id: productId,
        user_id: userId,
        session_id: sessionId
      };
      
      console.log('📝 Inserting view data:', viewData);

      const { data, error } = await supabase
        .from('product_views')
        .insert(viewData)
        .select();

      if (error) {
        console.error('❌ Error tracking view:', error);
        throw error;
      }
      
      console.log('✅ Product view tracked successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error tracking product view:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ProductAnalyticsService;
