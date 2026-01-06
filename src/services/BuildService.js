import { supabase } from '../lib/supabase';

/**
 * BuildService - Handle PC Build save/load operations with community features
 */
class BuildService {
  /**
   * Save a new PC build
   * @param {string} buildName - Name of the build
   * @param {Object} components - Selected components object
   * @param {number} totalPrice - Total price of build
   * @param {boolean} isPublic - Whether the build is public
   * @returns {Promise<Object>} Saved build object
   */
  async saveBuild(buildName, components, totalPrice, isPublic = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in to save builds');
      }

      // Get username from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const username = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Anonymous User'
        : 'Anonymous User';

      const { data, error } = await supabase
        .from('saved_builds')
        .insert([
          {
            user_id: user.id,
            build_name: buildName,
            components: components,
            total_price: totalPrice,
            is_public: isPublic,
            created_by_username: username
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all saved builds for current user
   * @returns {Promise<Array>} Array of saved builds
   */
  async getUserBuilds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', false) // Exclude drafts from saved builds list
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific build by ID
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} Build object
   */
  async getBuildById(buildId) {
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('id', buildId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing build
   * @param {string} buildId - Build ID
   * @param {string} buildName - New name
   * @param {Object} components - Updated components
   * @param {number} totalPrice - Updated total price
   * @returns {Promise<Object>} Updated build
   */
  async updateBuild(buildId, buildName, components, totalPrice) {
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .update({
          build_name: buildName,
          components: components,
          total_price: totalPrice
        })
        .eq('id', buildId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a build
   * @param {string} buildId - Build ID
   * @returns {Promise<void>}
   */
  async deleteBuild(buildId) {
    try {
      const { error } = await supabase
        .from('saved_builds')
        .delete()
        .eq('id', buildId);

      if (error) throw error;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate total price from components
   * @param {Object} components - Components object
   * @returns {number} Total price
   */
  calculateTotalPrice(components) {
    let total = 0;
    Object.values(components).forEach(product => {
      if (product && product.price) {
        const price = typeof product.price === 'string' 
          ? parseFloat(product.price.replace(/[^0-9.-]+/g, ''))
          : parseFloat(product.price);
        total += price;
      }
    });
    return total;
  }

  /**
   * Get all public builds sorted by popularity
   * @returns {Promise<Array>} Array of public builds
   */
  async getPublicBuilds() {
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('is_public', true)
        .order('likes_count', { ascending: false })
        .order('purchase_count', { ascending: false })
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle public/private status of a build
   * @param {string} buildId - Build ID
   * @param {boolean} isPublic - New public status
   * @returns {Promise<Object>} Updated build
   */
  async togglePublic(buildId, isPublic) {
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .update({ is_public: isPublic })
        .eq('id', buildId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Like a build
   * @param {string} buildId - Build ID
   * @returns {Promise<void>}
   */
  async likeBuild(buildId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in to like builds');
      }

      const { error } = await supabase
        .from('build_likes')
        .insert([
          {
            build_id: buildId,
            user_id: user.id
          }
        ]);

      if (error) throw error;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Unlike a build
   * @param {string} buildId - Build ID
   * @returns {Promise<void>}
   */
  async unlikeBuild(buildId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in to unlike builds');
      }

      const { error } = await supabase
        .from('build_likes')
        .delete()
        .eq('build_id', buildId)
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if current user has liked a build
   * @param {string} buildId - Build ID
   * @returns {Promise<boolean>} Whether user has liked the build
   */
  async hasLiked(buildId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('build_likes')
        .select('id')
        .eq('build_id', buildId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Increment view count for a build
   * @param {string} buildId - Build ID
   * @returns {Promise<void>}
   */
  async incrementViews(buildId) {
    try {
      const { error } = await supabase.rpc('increment_build_views', {
        build_id: buildId
      });

      if (error) {
        // Fallback if RPC function doesn't exist
        const { data: build } = await supabase
          .from('saved_builds')
          .select('view_count')
          .eq('id', buildId)
          .single();

        if (build) {
          await supabase
            .from('saved_builds')
            .update({ view_count: (build.view_count || 0) + 1 })
            .eq('id', buildId);
        }
      }
    } catch (error) {
      // Non-critical, don't throw
    }
  }

  /**
   * Increment purchase count for a build
   * @param {string} buildId - Build ID
   * @returns {Promise<void>}
   */
  async incrementPurchases(buildId) {
    try {
      const { error } = await supabase.rpc('increment_build_purchases', {
        build_id: buildId
      });

      if (error) {
        // Fallback if RPC function doesn't exist
        const { data: build } = await supabase
          .from('saved_builds')
          .select('purchase_count')
          .eq('id', buildId)
          .single();

        if (build) {
          await supabase
            .from('saved_builds')
            .update({ purchase_count: (build.purchase_count || 0) + 1 })
            .eq('id', buildId);
        }
      }
    } catch (error) {
      // Non-critical, don't throw
    }
  }

  /**
   * Get build statistics
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} Build stats
   */
  async getBuildStats(buildId) {
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .select('likes_count, purchase_count, view_count')
        .eq('id', buildId)
        .single();

      if (error) throw error;

      return {
        likes: data.likes_count || 0,
        purchases: data.purchase_count || 0,
        views: data.view_count || 0
      };
    } catch (error) {
      return { likes: 0, purchases: 0, views: 0 };
    }
  }

  /**
   * Save or update draft build (auto-save)
   * @param {Object} components - Selected components object
   * @param {number} totalPrice - Total price of build
   * @returns {Promise<Object>} Saved draft build object
   */
  async saveDraft(components, totalPrice) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Check if user already has a draft
      const { data: existingDraft } = await supabase
        .from('saved_builds')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_draft', true)
        .single();

      let result;

      if (existingDraft) {
        // Update existing draft
        const { data, error } = await supabase
          .from('saved_builds')
          .update({
            components: components,
            total_price: totalPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('saved_builds')
          .insert([
            {
              user_id: user.id,
              build_name: 'Draft Build',
              components: components,
              total_price: totalPrice,
              is_draft: true,
              is_public: false
            }
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      // Don't throw error, just log it (auto-save should be silent)
      return null;
    }
  }

  /**
   * Get user's draft build
   * @returns {Promise<Object|null>} Draft build or null
   */
  async getDraft() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete user's draft build
   * @returns {Promise<boolean>} Success status
   */
  async deleteDraft() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('saved_builds')
        .delete()
        .eq('user_id', user.id)
        .eq('is_draft', true);

      if (error) throw error;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert draft to named build
   * @param {string} buildName - Name for the build
   * @param {boolean} isPublic - Whether the build should be public
   * @returns {Promise<Object>} Updated build object
   */
  async convertDraftToSaved(buildName, isPublic = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in');
      }

      // Get username from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const username = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Anonymous User'
        : 'Anonymous User';

      // Update the draft
      const { data, error } = await supabase
        .from('saved_builds')
        .update({
          build_name: buildName,
          is_draft: false,
          is_public: isPublic,
          created_by_username: username
        })
        .eq('user_id', user.id)
        .eq('is_draft', true)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new BuildService();
