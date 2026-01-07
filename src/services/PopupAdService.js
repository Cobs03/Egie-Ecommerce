import { supabase } from '../lib/supabase';

class PopupAdService {
  // Get active popup ads for display on customer site
  async getActivePopupAds(page = 'home') {
    try {
      const now = new Date().toISOString();
      
      // Get all active popup ads first
      let query = supabase
        .from('popup_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Filter by date range and page on the client side for more reliable filtering
      const filteredData = data?.filter(popup => {
        // Check date range
        const startDateValid = !popup.start_date || new Date(popup.start_date) <= new Date(now);
        const endDateValid = !popup.end_date || new Date(popup.end_date) >= new Date(now);
        
        // Check page match
        const pageMatch = page === 'all' || 
                         popup.show_on_pages?.includes('all') || 
                         popup.show_on_pages?.includes(page);
        
        return startDateValid && endDateValid && pageMatch;
      });

      return { data: filteredData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Check if popup should be shown based on display frequency
  shouldShowPopup(popupId, frequency) {
    const storageKey = `popup_shown_${popupId}`;

    switch (frequency) {
      case 'once_per_session':
        // Check sessionStorage (clears when browser closes)
        return !sessionStorage.getItem(storageKey);

      case 'once_per_day':
        // Check localStorage with timestamp
        const lastShown = localStorage.getItem(storageKey);
        if (!lastShown) return true;
        
        const lastShownTime = new Date(lastShown);
        const now = new Date();
        const hoursSinceShown = (now - lastShownTime) / (1000 * 60 * 60);
        
        return hoursSinceShown >= 24;

      case 'every_visit':
        // Always show
        return true;

      case 'once_forever':
        // Check localStorage (permanent until cleared)
        return !localStorage.getItem(storageKey);

      default:
        return false;
    }
  }

  // Mark popup as shown based on frequency
  markAsShown(popupId, frequency) {
    const storageKey = `popup_shown_${popupId}`;
    const timestamp = new Date().toISOString();

    switch (frequency) {
      case 'once_per_session':
        sessionStorage.setItem(storageKey, timestamp);
        break;

      case 'once_per_day':
      case 'once_forever':
        localStorage.setItem(storageKey, timestamp);
        break;

      case 'every_visit':
        // Don't store anything
        break;
    }
  }

  // Track impression (analytics)
  async trackImpression(popupId) {
    try {
      const { error } = await supabase
        .rpc('increment_popup_impression', { popup_id: popupId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Track click (analytics)
  async trackClick(popupId) {
    try {
      const { error } = await supabase
        .rpc('increment_popup_click', { popup_id: popupId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
}

export default new PopupAdService();
