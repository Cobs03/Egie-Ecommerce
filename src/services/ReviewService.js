import { supabase } from '../lib/supabase';

/**
 * ReviewService - Product Reviews & Ratings Management
 * 
 * Features:
 * - Get product reviews with pagination
 * - Get product rating summary (average, count, breakdown)
 * - Add/Edit/Delete reviews
 * - Check if user has reviewed a product
 * - Mark review as helpful (future feature)
 */

class ReviewService {
  
  /**
   * Get reviews for a product
   * @param {string} product_id - Product UUID
   * @param {number} limit - Number of reviews to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Object} { data: [reviews], error }
   */
  async getProductReviews(product_id, limit = 10, offset = 0) {
    try {
      // Get reviews with user info already stored in the table
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        return { data: [], error: reviewsError.message };
      }

      // Reviews now include user_email and user_name from the database
      return { data: reviews || [], error: null };
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get rating summary for a product
   * @param {string} product_id - Product UUID
   * @returns {Object} { data: { average_rating, total_reviews, breakdown }, error }
   */
  async getProductRatingSummary(product_id) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', product_id);

      if (error) {
        return { 
          data: { 
            average_rating: 0, 
            total_reviews: 0, 
            rating_5_count: 0,
            rating_4_count: 0,
            rating_3_count: 0,
            rating_2_count: 0,
            rating_1_count: 0
          }, 
          error: error.message 
        };
      }

      const reviews = data || [];
      const total_reviews = reviews.length;

      if (total_reviews === 0) {
        return {
          data: {
            average_rating: 0,
            total_reviews: 0,
            rating_5_count: 0,
            rating_4_count: 0,
            rating_3_count: 0,
            rating_2_count: 0,
            rating_1_count: 0
          },
          error: null
        };
      }

      // Calculate average
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average_rating = (sum / total_reviews).toFixed(2);

      // Calculate breakdown
      const rating_5_count = reviews.filter(r => r.rating === 5).length;
      const rating_4_count = reviews.filter(r => r.rating === 4).length;
      const rating_3_count = reviews.filter(r => r.rating === 3).length;
      const rating_2_count = reviews.filter(r => r.rating === 2).length;
      const rating_1_count = reviews.filter(r => r.rating === 1).length;

      return {
        data: {
          average_rating: parseFloat(average_rating),
          total_reviews,
          rating_5_count,
          rating_4_count,
          rating_3_count,
          rating_2_count,
          rating_1_count
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getProductRatingSummary:', error);
      return { 
        data: { 
          average_rating: 0, 
          total_reviews: 0, 
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } 
        }, 
        error: error.message 
      };
    }
  }

  /**
   * Check if current user has reviewed a product
   * @param {string} product_id - Product UUID
   * @returns {Object} { data: { hasReviewed, review }, error }
   */
  async hasUserReviewed(product_id) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: { hasReviewed: false, review: null }, error: null };
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        return { data: { hasReviewed: false, review: null }, error: error.message };
      }

      return {
        data: {
          hasReviewed: !!data,
          review: data
        },
        error: null
      };
    } catch (error) {
      console.error('Error in hasUserReviewed:', error);
      return { data: { hasReviewed: false, review: null }, error: error.message };
    }
  }

  /**
   * Add a review for a product
   * @param {Object} params - { product_id, rating, title, comment }
   * @returns {Object} { data, error }
   */
  async addReview({ product_id, rating, title = '', comment = '' }) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return { data: null, error: 'Rating must be between 1 and 5' };
      }

      // Get user name from metadata or email
      const userName = user.user_metadata?.name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Anonymous User';

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id,
          user_id: user.id,
          rating,
          title,
          comment,
          user_email: user.email,
          user_name: userName
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          return { data: null, error: 'You have already reviewed this product. Please edit your existing review.' };
        }
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in addReview:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update an existing review
   * @param {string} review_id - Review UUID
   * @param {Object} updates - { rating, title, comment }
   * @returns {Object} { data, error }
   */
  async updateReview(review_id, { rating, title, comment }) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return { data: null, error: 'Rating must be between 1 and 5' };
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .update({
          rating,
          title,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', review_id)
        .eq('user_id', user.id) // Ensure user owns the review
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateReview:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a review
   * @param {string} review_id - Review UUID
   * @returns {Object} { data, error }
   */
  async deleteReview(review_id) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', review_id)
        .eq('user_id', user.id) // Ensure user owns the review
        .select();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in deleteReview:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all reviews from database (for admin or stats)
   * @returns {Object} { data: [reviews], error }
   */
  async getAllReviews() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products(name, images)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      return { data: [], error: error.message };
    }
  }
}

export default new ReviewService();
