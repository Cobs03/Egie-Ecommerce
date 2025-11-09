import { useState, useEffect } from 'react'
import { ProductService } from '../services/ProductService'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Static fallback categories to maintain design
  const staticCategories = [
    'Processor',
    'Graphics Card',
    'Memory',
    'Storage',
    'Motherboard',
    'Power Supply',
    'Cooling',
    'Case',
    'Peripherals',
    'Accessories'
  ]

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await ProductService.getCategories()
        
        if (result.success && result.data.length > 0) {
          setCategories(result.data)
        } else {
          // Fallback to static categories
          setCategories(staticCategories)
        }
      } catch (err) {
        setError(err.message)
        // Fallback to static categories on error
        setCategories(staticCategories)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return {
    categories,
    loading,
    error
  }
}