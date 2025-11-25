import { useState, useEffect, useCallback } from 'react'
import { ProductService } from '../services/ProductService'

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Load products
  const loadProducts = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await ProductService.getFilteredProducts(filters)
      
      if (result.success) {
        // Transform products to match existing UI structure
        const transformedProducts = result.data.map(product => 
          ProductService.transformProductData(product)
        )
        setProducts(transformedProducts)
      } else {
        setError(result.error)
        setProducts([])
      }
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const result = await ProductService.getCategories()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadProducts(initialFilters)
    loadCategories()
  }, [loadProducts, loadCategories])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = ProductService.subscribeToProducts((payload) => {
      console.log('Real-time product update:', payload)
      
      // Reload products when there are changes
      loadProducts(initialFilters)
    })

    return () => {
      ProductService.unsubscribeFromProducts(subscription)
    }
  }, [loadProducts, initialFilters])

  return {
    products,
    loading,
    error,
    categories,
    refetch: loadProducts,
    setFilters: loadProducts
  }
}

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }

    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await ProductService.getProductById(productId)
        
        if (result.success) {
          const transformedProduct = ProductService.transformProductData(result.data)
          setProduct(transformedProduct)
        } else {
          setError(result.error)
          setProduct(null)
        }
      } catch (err) {
        setError(err.message)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  return {
    product,
    loading,
    error
  }
}