import React, { useState, useEffect } from 'react';
import { IoCloseCircleOutline } from 'react-icons/io5';
import StarRatingInput from './StarRatingInput';
import ReviewService from '../services/ReviewService';
import { toast } from 'sonner';

/**
 * ReviewModal Component
 * Modal for writing/editing product reviews
 * 
 * @param {Object} product - Product object { id, name, title, image }
 * @param {Function} onClose - Close modal callback (pass true to refresh parent)
 * @param {Object} existingReview - Existing review if editing (optional)
 * @param {Object} user - Current user object
 */
const ReviewModal = ({ product, onClose, existingReview = null, user }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to write a review');
      onClose(false);
    }
  }, [user, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    
    try {
      if (existingReview) {
        // Update existing review
        const { data, error } = await ReviewService.updateReview(existingReview.id, {
          rating,
          title: title.trim(),
          comment: comment.trim()
        });
        
        if (error) {
          toast.error('Failed to update review', { description: error });
        } else {
          toast.success('Review updated!', { 
            description: 'Your review has been updated successfully.' 
          });
          onClose(true); // Pass true to indicate refresh needed
        }
      } else {
        // Add new review
        const { data, error } = await ReviewService.addReview({
          product_id: product.id,
          rating,
          title: title.trim(),
          comment: comment.trim()
        });
        
        if (error) {
          if (error.includes('already reviewed')) {
            toast.error('You have already reviewed this product', {
              description: 'You can only review a product once.'
            });
          } else {
            toast.error('Failed to add review', { description: error });
          }
        } else {
          toast.success('Review submitted!', { 
            description: 'Thank you for your feedback!' 
          });
          onClose(true);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={() => onClose(false)}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <IoCloseCircleOutline size={32} />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name || product.title}
                className="w-16 h-16 object-contain rounded border"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {product.name || product.title}
              </h3>
              <p className="text-sm text-gray-500">
                Share your experience with this product
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block font-semibold text-gray-700 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarRatingInput 
              value={rating} 
              onChange={setRating}
              size={32}
              required={true}
            />
          </div>

          {/* Title Section */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Review Title <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Sum up your experience in one line"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/200 characters
            </p>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Your Review <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              placeholder="Tell us what you liked or didn't like about this product. How does it compare to similar products you've used?"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific and honest. Your review helps others make informed decisions.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">
              📝 Review Guidelines
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be honest and constructive</li>
              <li>• Focus on product features and quality</li>
              <li>• Avoid inappropriate language</li>
              <li>• Don't include personal information</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={submitting}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 bg-green-500 text-white font-semibold rounded-lg px-6 py-3 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>{existingReview ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
