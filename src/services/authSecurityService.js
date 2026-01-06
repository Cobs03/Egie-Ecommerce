/**
 * Authentication Security Service
 * Integrates breach detection and login monitoring with authentication
 */

import { supabase } from '../config/supabaseClient';

/**
 * Check if an IP address is blacklisted
 */
export const checkIpBlacklist = async (ipAddress) => {
  try {
    const { data, error } = await supabase
      .rpc('is_ip_blacklisted', { p_ip_address: ipAddress });
    
    if (error) {
      return false;
    }
    
    return data === true;
  } catch (error) {
    return false;
  }
};

/**
 * Get user's IP address (client-side approximation)
 * Note: For production, use a backend API to get real IP
 */
export const getUserIpAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Log failed login attempt
 */
export const logFailedLogin = async (email, failureReason = 'invalid_credentials') => {
  try {
    const ipAddress = await getUserIpAddress();
    const userAgent = navigator.userAgent;
    
    // Check if IP is blacklisted first
    const isBlocked = await checkIpBlacklist(ipAddress);
    if (isBlocked) {
      throw new Error('Your IP address has been temporarily blocked due to suspicious activity. Please try again later or contact support.');
    }
    
    const { error } = await supabase.rpc('log_failed_login', {
      p_email: email,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_failure_reason: failureReason
    });
    
    if (error) {
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Log successful login
 */
export const logSuccessfulLogin = async (userId, email) => {
  try {
    const ipAddress = await getUserIpAddress();
    const userAgent = navigator.userAgent;
    
    const { error } = await supabase.rpc('log_successful_login', {
      p_user_id: userId,
      p_email: email,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });
    
    if (error) {
    }
  } catch (error) {
  }
};

/**
 * Enhanced login with security monitoring
 */
export const secureLogin = async (email, password) => {
  try {
    // Check if IP is blacklisted before attempting login
    const ipAddress = await getUserIpAddress();
    const isBlocked = await checkIpBlacklist(ipAddress);
    
    if (isBlocked) {
      throw new Error('Your IP address has been temporarily blocked due to suspicious activity. Please try again later or contact support.');
    }
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Log failed attempt
      await logFailedLogin(email, error.message.includes('Invalid') ? 'invalid_credentials' : 'other');
      throw error;
    }
    
    // Log successful login
    await logSuccessfulLogin(data.user.id, email);
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent security alerts for current user
 */
export const getSecurityAlerts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { newLocations: [], suspiciousActivities: [] };
    
    // Get recent logins from new locations
    const { data: newLocations } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_new_location', true)
      .gte('login_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('login_time', { ascending: false });
    
    // Get suspicious activities
    const { data: suspiciousActivities } = await supabase
      .from('suspicious_activities')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['detected', 'investigating'])
      .order('detected_at', { ascending: false });
    
    return {
      newLocations: newLocations || [],
      suspiciousActivities: suspiciousActivities || []
    };
  } catch (error) {
    return { newLocations: [], suspiciousActivities: [] };
  }
};

/**
 * Check for security alerts and show notifications
 */
export const checkSecurityAlertsOnLogin = async () => {
  try {
    const alerts = await getSecurityAlerts();
    
    if (alerts.newLocations.length > 0) {
      // Show notification about new location login
      const latestLogin = alerts.newLocations[0];
      // In production, show a user-facing notification
      // Example: showNotification('New location login detected. If this wasn\'t you, please secure your account.');
    }
    
    if (alerts.suspiciousActivities.length > 0) {
      // Show notification about suspicious activity
      // In production, show a user-facing notification
      // Example: showNotification('Suspicious activity detected on your account. Please review your security settings.');
    }
    
    return alerts;
  } catch (error) {
    return null;
  }
};

/**
 * Enhanced signup with security monitoring
 */
export const secureSignup = async (email, password, userData = {}) => {
  try {
    // Check if IP is blacklisted
    const ipAddress = await getUserIpAddress();
    const isBlocked = await checkIpBlacklist(ipAddress);
    
    if (isBlocked) {
      throw new Error('Account creation is temporarily unavailable from your location. Please contact support.');
    }
    
    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    
    // Log successful signup as a login
    if (data.user) {
      await logSuccessfulLogin(data.user.id, email);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  checkIpBlacklist,
  getUserIpAddress,
  logFailedLogin,
  logSuccessfulLogin,
  secureLogin,
  secureSignup,
  getSecurityAlerts,
  checkSecurityAlertsOnLogin
};
