import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import InquiryFormModal from './InquiryFormModal';
import BundleReviewService from '../services/BundleReviewService';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

/**
 * BundleReviewsSection Component
 * Complete reviews section for bundle details page
 * Shows: Rating summary, reviews list, write/edit review functionality
 * 
 * @param {Object} bundle - Bundle object { id, bundle_name, images }
 */
const BundleReviewsSection = ({ bundle }) => {
  const [user, setUser] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // Load user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load reviews and summary
  useEffect(() => {
    loadReviews();
  }, [bundle.id, user]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Load rating summary
      const { data: summary } = await BundleReviewService.getBundleRatingSummary(bundle.id);
      setRatingSummary(summary);

      // Load reviews
      const { data: reviewsData } = await BundleReviewService.getBundleReviews(bundle.id, 50, 0);
      setReviews(reviewsData || []);

      // Check if current user has reviewed
      if (user) {
        const { data: userReviewData } = await BundleReviewService.hasUserReviewed(bundle.id);
        setUserReview(userReviewData?.hasReviewed ? userReviewData.review : null);
      } else {
        setUserReview(null);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleAskQuestion = () => {
    if (!user) {
      toast.error('Please login to ask a question');
      return;
    }
    setShowInquiryModal(true);
  };

  const handleEditReview = () => {
    setEditingReview(userReview);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async () => {
    setShowDeleteConfirm(false);
    
    try {
      const { error } = await BundleReviewService.deleteReview(userReview.id);
      if (error) {
        toast.error('Failed to delete review');
      } else {
        toast.success('Review deleted successfully');
        loadReviews();
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowReviewModal(false);
    setEditingReview(null);
    if (shouldRefresh) {
      loadReviews();
    }
  };

  const handleInquiryModalClose = (shouldRefresh) => {
    setShowInquiryModal(false);
    if (shouldRefresh) {
      toast.success('Question submitted successfully');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4">Loading reviews...</p>
      </div>
    );
  }

  const totalReviews = ratingSummary?.total_reviews || 0;
  const averageRating = ratingSummary?.average_rating || 0;

  return (
    <div className="py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Average Rating */}
          <div className="text-center md:border-r md:pr-6">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size={20} />
            <p className="text-sm text-gray-500 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Breakdown */}
          {totalReviews > 0 && (
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingSummary?.[`rating_${star}_count`] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{star}</span>
                      <FaStar className="text-yellow-400 text-xs" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Button or User's Review + Ask Question Button */}
      <div className="mb-6 flex flex-wrap gap-3">
        {userReview ? (
          <div className="flex-1 min-w-full lg:min-w-0">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Your Review</p>
                  <StarRating rating={userReview.rating} size={16} />
                  {userReview.title && (
                    <p className="font-medium mt-2">{userReview.title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEditReview}
                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded transition-all active:scale-95"
                    title="Edit your review"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded transition-all active:scale-95"
                    title="Delete your review"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleWriteReview}
            className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 active:scale-95"
          >
            <FaStar /> Write a Review
          </button>
        )}

        <button
          onClick={handleAskQuestion}
          className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95"
        >
          <FaQuestionCircle /> Ask a Question
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-200 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
          <p className="text-gray-500 text-sm">Be the first to review this bundle!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const profile = review.profiles;
            const userName = profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'
              : 'Anonymous';
            const avatarUrl = profile?.avatar_url;

            return (
              <div key={review.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* User info and rating */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{userName}</p>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Review title */}
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                    )}

                    {/* Review comment */}
                    <p className="text-gray-700">{review.comment}</p>

                    {/* Verified purchase badge */}
                    {review.verified_purchase && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          product={{ 
            ...bundle, 
            name: bundle.bundle_name || bundle.name,
            image: bundle.images?.[0]
          }}
          existingReview={editingReview}
          onClose={handleModalClose}
          user={user}
          isBundle={true}
          bundleId={bundle.id}
        />
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <InquiryFormModal
          product={{
            ...bundle,
            name: bundle.bundle_name || bundle.name,
            image: bundle.images?.[0]
          }}
          onClose={handleInquiryModalClose}
          user={user}
          isBundle={true}
          bundleId={bundle.id}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Review?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete your review? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleReviewsSection;
