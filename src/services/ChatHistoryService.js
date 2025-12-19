/**
 * Chat History Service
 * Manages chat conversation persistence in Supabase
 */

import { supabase } from '../lib/supabase';

class ChatHistoryService {
  /**
   * Save a chat message to database
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   * @returns {Promise<Object>} Result
   */
  async saveMessage(userId, message) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          message_id: message.id,
          text: message.text,
          sender: message.sender,
          products: message.products || null,
          is_general_question: message.isGeneralQuestion || false,
          category_for_view_more: message.categoryForViewMore || null,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load chat history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum messages to load
   * @returns {Promise<Array>} Array of messages
   */
  async loadHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Transform database records back to message format
      const messages = data.map(record => ({
        id: record.message_id,
        text: record.text,
        sender: record.sender,
        timestamp: new Date(record.created_at),
        products: record.products,
        isGeneralQuestion: record.is_general_question,
        categoryForViewMore: record.category_for_view_more
      }));

      return { success: true, messages };
    } catch (error) {
      console.error('Error loading history:', error);
      return { success: false, error: error.message, messages: [] };
    }
  }

  /**
   * Clear chat history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async clearHistory(userId) {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversation summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Summary data
   */
  async getConversationSummary(userId) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const summary = {
        totalMessages: data.length,
        userMessages: data.filter(m => m.sender === 'user').length,
        aiMessages: data.filter(m => m.sender === 'ai').length,
        productsShown: data.filter(m => m.products && m.products.length > 0).length,
        lastActivity: data.length > 0 ? new Date(data[data.length - 1].created_at) : null
      };

      return { success: true, summary };
    } catch (error) {
      console.error('Error getting summary:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ChatHistoryService();
