import { supabase } from '../lib/supabase';

/**
 * BundleReviewService
 * Handles all bundle review operations (CRUD) for bundles
 * Works with bundle_reviews table
 */
class BundleReviewService {
  /**
   * Get rating summary for a bundle
   */
  static async getBundleRatingSummary(bundleId) {
    try {
      const { data, error } = await supabase
        .from('bundle_reviews')
        .select('rating')
        .eq('bundle_id', bundleId);

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

      // Calculate average rating
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average_rating = sum / total_reviews;

      // Count ratings by star
      const rating_counts = reviews.reduce((acc, review) => {
        acc[`rating_${review.rating}_count`] = (acc[`rating_${review.rating}_count`] || 0) + 1;
        return acc;
      }, {});

      return { 
        data: {
          average_rating: parseFloat(average_rating.toFixed(1)),
          total_reviews,
          rating_5_count: rating_counts.rating_5_count || 0,
          rating_4_count: rating_counts.rating_4_count || 0,
          rating_3_count: rating_counts.rating_3_count || 0,
          rating_2_count: rating_counts.rating_2_count || 0,
          rating_1_count: rating_counts.rating_1_count || 0
        }, 
        error: null 
      };
    } catch (error) {
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
  }

  /**
   * Get reviews for a bundle with pagination
   */
  static async getBundleReviews(bundleId, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('bundle_reviews')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('bundle_id', bundleId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Check if user has reviewed this bundle
   */
  static async hasUserReviewed(bundleId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: { hasReviewed: false, review: null }, error: null };
      }

      const { data, error } = await supabase
        .from('bundle_reviews')
        .select('*')
        .eq('bundle_id', bundleId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        return { data: { hasReviewed: false, review: null }, error };
      }

      return { 
        data: { 
          hasReviewed: !!data, 
          review: data 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: { hasReviewed: false, review: null }, error };
    }
  }

  /**
   * Create a new bundle review
   */
  static async createReview(bundleId, reviewData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('bundle_reviews')
        .insert({
          bundle_id: bundleId,
          user_id: user.id,
          rating: reviewData.rating,
          title: reviewData.title || null,
          comment: reviewData.comment,
          verified_purchase: false
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update an existing bundle review
   */
  static async updateReview(reviewId, reviewData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('bundle_reviews')
        .update({
          rating: reviewData.rating,
          title: reviewData.title || null,
          comment: reviewData.comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a bundle review
   */
  static async deleteReview(reviewId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('bundle_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }
}

export default BundleReviewService;
