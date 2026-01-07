import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useWebsiteSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        throw error;
      }
      
      // If we got data, use it
      if (data) {
        setSettings({
          brandName: data.brand_name || 'EGIE E-Commerce',
          logoUrl: data.logo_url || '',
          authBackgroundUrl: data.auth_background_url || '',
          primaryColor: data.primary_color || '#22c55e',
          secondaryColor: data.secondary_color || '#2176ae',
          accentColor: data.accent_color || '#ffe14d',
          contactEmail: data.contact_email || 'support@egiegameshop.com',
          contactPhone: data.contact_phone || '(123) 456-7890',
          contactAddress: data.contact_address || '1234 Street Address City Address, 1234',
          showroomHours: data.showroom_hours || 'Mon-Sunday: 8:00 AM - 5:30 PM',
          facebookUrl: data.facebook_url || 'https://facebook.com',
          instagramUrl: data.instagram_url || 'https://instagram.com',
          tiktokUrl: data.tiktok_url || '',
          twitterUrl: data.twitter_url || '',
          aboutUsTitle: data.about_us_title || 'About Us',
          aboutUsContent: data.about_us_content || 'Welcome to our gaming store!',
          footerText: data.footer_text || 'All rights reserved.',
          termsAndConditions: data.terms_and_conditions || null,
          privacyPolicy: data.privacy_policy || null,
          aiName: data.ai_name || 'AI Assistant',
          aiLogoUrl: data.ai_logo_url || '/Logo/Ai.png',
        });
        return; // Success - exit here
      }
    } catch (err) {
      setError(err.message);
      // Set defaults if fetch fails
      setSettings({
        brandName: 'EGIE Gameshop',
        logoUrl: '',
        authBackgroundUrl: '',
        primaryColor: '#22c55e',
        secondaryColor: '#2176ae',
        accentColor: '#ffe14d',
        contactEmail: 'support@egiegameshop.com',
        contactPhone: '(123) 456-7890',
        contactAddress: '1234 Street Address City Address, 1234',
        showroomHours: 'Mon-Sunday: 8:00 AM - 5:30 PM',
        facebookUrl: 'https://facebook.com',
        instagramUrl: 'https://instagram.com',
        tiktokUrl: '',
        twitterUrl: '',
        aboutUsTitle: 'About Us',
        aboutUsContent: 'Welcome to our gaming store!',
        footerText: 'All rights reserved.',
      });
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
};
