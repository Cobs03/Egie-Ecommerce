/**
 * Geolocation Service for Philippines-Only Restriction
 * Validates that users are accessing from the Philippines
 */

import { supabase } from '../config/supabaseClient';

/**
 * Get user's geolocation from IP address
 * Uses ipapi.co free API (1000 requests/day)
 * For production, consider paid service or backend proxy
 */
export const getUserGeolocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      ip: data.ip,
      countryCode: data.country_code,
      countryName: data.country_name,
      city: data.city,
      region: data.region,
      isPhilippines: data.country_code === 'PH'
    };
  } catch (error) {
    // Fallback: Allow access if geolocation fails (prevent false blocks)
    return {
      ip: 'unknown',
      countryCode: 'unknown',
      countryName: 'unknown',
      city: null,
      region: null,
      isPhilippines: true // Default to allow to prevent blocking legitimate users
    };
  }
};

/**
 * Check if user is accessing from Philippines
 */
export const isAccessFromPhilippines = async () => {
  const location = await getUserGeolocation();
  return location.isPhilippines;
};

/**
 * Log geo-blocked access attempt
 */
export const logGeoBlock = async (location, attemptedUrl = null) => {
  try {
    const { error } = await supabase.rpc('log_geo_block', {
      p_ip_address: location.ip,
      p_country_code: location.countryCode,
      p_country_name: location.countryName,
      p_attempted_url: attemptedUrl,
      p_user_agent: navigator.userAgent
    });
    
    if (error) {
    }
  } catch (error) {
  }
};

/**
 * Validate user location and block if outside Philippines
 * @param {boolean} strict - If true, strictly enforce Philippines-only. If false, log but allow.
 * @returns {Object} { allowed: boolean, location: object, message: string }
 */
export const validateUserLocation = async (strict = false) => {
  try {
    const location = await getUserGeolocation();
    
    if (!location.isPhilippines) {
      // Log the blocked attempt
      await logGeoBlock(location, window.location.href);
      
      if (strict) {
        return {
          allowed: false,
          location,
          message: 'Access Restricted: This service is only available within the Philippines. If you are in the Philippines and seeing this message, please contact support.'
        };
      } else {
        // Log but allow (useful during testing)
        return {
          allowed: true,
          location,
          message: 'Warning: Accessing from outside Philippines'
        };
      }
    }
    
    return {
      allowed: true,
      location,
      message: 'Access allowed from Philippines'
    };
  } catch (error) {
    // On error, allow access to prevent blocking legitimate users
    return {
      allowed: true,
      location: null,
      message: 'Location check failed - access allowed'
    };
  }
};

/**
 * Validate Philippines address format
 */
export const validatePhilippinesAddress = (address) => {
  const errors = {};
  
  // Check country
  const country = address.country?.toLowerCase() || '';
  if (!['philippines', 'ph', 'phl'].includes(country)) {
    errors.country = 'Only addresses within the Philippines are accepted';
  }
  
  // Check required fields
  if (!address.street_address || address.street_address.trim() === '') {
    errors.street_address = 'Street address is required';
  }
  
  if (!address.city || address.city.trim() === '') {
    errors.city = 'City is required';
  }
  
  if (!address.province || address.province.trim() === '') {
    errors.province = 'Province is required';
  }
  
  if (!address.postal_code || address.postal_code.trim() === '') {
    errors.postal_code = 'Postal code is required';
  } else {
    // Validate Philippine postal code format (4 digits)
    const postalCodeRegex = /^\d{4}$/;
    if (!postalCodeRegex.test(address.postal_code)) {
      errors.postal_code = 'Philippine postal code must be 4 digits';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get list of Philippine provinces
 */
export const getPhilippineProvinces = async () => {
  try {
    const { data, error } = await supabase
      .from('philippine_provinces')
      .select('province_name, region_name')
      .eq('is_active', true)
      .order('province_name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    // Return common provinces as fallback
    return [
      { province_name: 'Metro Manila', region_name: 'National Capital Region' },
      { province_name: 'Cavite', region_name: 'CALABARZON' },
      { province_name: 'Laguna', region_name: 'CALABARZON' },
      { province_name: 'Batangas', region_name: 'CALABARZON' },
      { province_name: 'Rizal', region_name: 'CALABARZON' },
      { province_name: 'Bulacan', region_name: 'Central Luzon' },
      { province_name: 'Pampanga', region_name: 'Central Luzon' },
      { province_name: 'Cebu', region_name: 'Central Visayas' },
      { province_name: 'Davao del Sur', region_name: 'Davao Region' }
    ];
  }
};

/**
 * Check if payment processor is Philippines-based
 */
export const isPaymentProcessorLocal = (processor) => {
  const localProcessors = ['paymongo', 'gcash', 'paymaya', 'dragonpay'];
  return localProcessors.includes(processor.toLowerCase());
};

/**
 * Get data residency report
 */
export const getDataResidencyReport = async () => {
  try {
    const { data, error } = await supabase
      .from('data_residency_report')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get Philippine DPA compliance summary
 */
export const getDPAComplianceSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('dpa_compliance_summary')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    return [];
  }
};

/**
 * Initialize geolocation check on app load
 * Set strict=true for production, false for development/testing
 */
export const initializeGeolocationCheck = async (strict = false) => {
  const validation = await validateUserLocation(strict);
  
  if (!validation.allowed) {
    // Store blocked status
    sessionStorage.setItem('geo_blocked', 'true');
    sessionStorage.setItem('geo_location', JSON.stringify(validation.location));
  } else {
    sessionStorage.removeItem('geo_blocked');
    if (validation.location) {
      sessionStorage.setItem('geo_location', JSON.stringify(validation.location));
    }
  }
  
  return validation;
};

/**
 * Check if user is currently geo-blocked
 */
export const isGeoBlocked = () => {
  return sessionStorage.getItem('geo_blocked') === 'true';
};

/**
 * Get stored location data
 */
export const getStoredLocation = () => {
  const stored = sessionStorage.getItem('geo_location');
  return stored ? JSON.parse(stored) : null;
};

export default {
  getUserGeolocation,
  isAccessFromPhilippines,
  logGeoBlock,
  validateUserLocation,
  validatePhilippinesAddress,
  getPhilippineProvinces,
  isPaymentProcessorLocal,
  getDataResidencyReport,
  getDPAComplianceSummary,
  initializeGeolocationCheck,
  isGeoBlocked,
  getStoredLocation
};
