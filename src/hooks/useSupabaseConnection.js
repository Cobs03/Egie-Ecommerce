import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Test connection by trying to fetch from products table
        const { data, error } = await supabase
          .from('products')
          .select('count', { count: 'exact', head: true })

        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
        }
      } catch (err) {
        setError(err.message)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    testConnection()

    // Set up a periodic connection check
    const interval = setInterval(testConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { isConnected, isLoading, error }
}