import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get full image URL from storage
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove 'products/' prefix if present
  const cleanPath = path.replace(/^products\//, '');
  
  // Remove leading slash if present
  const finalPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  
  // Construct full URL
  return `${supabaseUrl}/storage/v1/object/public/products/${finalPath}`;
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  return {
    success: false,
    error: error.message || 'An unexpected error occurred'
  }
}

// Helper function for successful responses
export const handleSupabaseSuccess = (data) => {
  return {
    success: true,
    data
  }
}