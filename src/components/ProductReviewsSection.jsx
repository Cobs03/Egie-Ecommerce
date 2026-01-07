import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import InquiryFormModal from './InquiryFormModal';
import ReviewService from '../services/ReviewService';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';

/**
 * ProductReviewsSection Component
 * Complete reviews section for product details page
 * Shows: Rating summary, reviews list, write/edit review functionality
 * 
 * @param {Object} product - Product object { id, name, title, image }
 */
const ProductReviewsSection = ({ product }) => {
  const [user, setUser] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Load user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load reviews and summary
  useEffect(() => {
    loadReviews();
    setCurrentPage(1); // Reset to first page when product changes
  }, [product.id, user]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Load rating summary
      const { data: summary, error: summaryError } = await ReviewService.getProductRatingSummary(product.id);
      setRatingSummary(summary);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await ReviewService.getProductReviews(product.id, 50, 0);
      setReviews(reviewsData || []);

      // Check if current user has reviewed
      if (user) {
        const { data: userReviewData } = await ReviewService.hasUserReviewed(product.id);
        setUserReview(userReviewData.hasReviewed ? userReviewData.review : null);
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
    setShowDeleteConfirm(false); // Close confirmation dialog
    
    try {
      const { error } = await ReviewService.deleteReview(userReview.id);
      if (error) {
        toast.error('Failed to delete review', { description: 'Please try again later.' });
      } else {
        toast.success('Review deleted successfully', { 
          description: 'Your review has been removed from this product.' 
        });
        loadReviews(); // Refresh
      }
    } catch (error) {
      toast.error('Something went wrong', { description: 'Unable to delete review.' });
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowReviewModal(false);
    setEditingReview(null);
    if (shouldRefresh) {
      loadReviews(); // Refresh reviews
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

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
      <div className="mb-6">
        {userReview ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {userReview.profiles?.avatar_url ? (
                    <img 
                      src={userReview.profiles.avatar_url} 
                      alt="Your avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-blue-800 mb-1">
                        {userReview.profiles 
                          ? `${userReview.profiles.first_name || ''} ${userReview.profiles.last_name || ''}`.trim() || 'Your Review'
                          : 'Your Review'}
                      </p>
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
            </div>
            
            {/* Ask Question Button - Below user's review */}
            <button
              onClick={handleAskQuestion}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95 active:shadow-inner"
            >
              <FaQuestionCircle /> Ask a Question
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleWriteReview}
              className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 active:scale-95 active:shadow-inner"
            >
              <FaStar /> Write a Review
            </button>
            
            {/* Ask Question Button - Next to Write Review */}
            <button
              onClick={handleAskQuestion}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95 active:shadow-inner"
            >
              <FaQuestionCircle /> Ask a Question
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-200 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
          <p className="text-gray-500 text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentReviews.map((review) => {
            // Get user profile data
            const profile = review.profiles;
            const userName = profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'
              : review.user_name || 'Anonymous';
            const avatarUrl = profile?.avatar_url;

            return (
              <div 
                key={review.id} 
                className={`border rounded-lg p-4 ${
                  review.user_id === user?.id ? 'bg-blue-50 border-blue-200' : 'bg-white'
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    {/* User Info Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {userName}
                          </p>
                          {review.user_id === user?.id && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={14} />
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {review.title}
                      </h3>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {review.comment}
                      </p>
                    )}

                    {/* Edited Label */}
                    {review.updated_at !== review.created_at && (
                      <p className="text-xs text-gray-400 italic">
                        Edited {new Date(review.updated_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={`transition-all active:scale-95 ${
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="transition-all active:scale-95"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={`transition-all active:scale-95 ${
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Review?
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete your review? This action cannot be undone and your rating will be removed from this product.
                </p>
              </div>
            </div>

            {/* Review Preview */}
            {userReview && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={userReview.rating} size={14} />
                  <span className="text-sm text-gray-600">
                    {userReview.rating} stars
                  </span>
                </div>
                {userReview.title && (
                  <p className="font-medium text-gray-800 mb-1">{userReview.title}</p>
                )}
                {userReview.comment && (
                  <p className="text-sm text-gray-600 line-clamp-2">{userReview.comment}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-all active:scale-95 active:shadow-inner"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          product={{
            id: product.id,
            name: product.name || product.title,
            image: typeof product.images === 'string' 
              ? JSON.parse(product.images)[0]
              : product.images?.[0]?.url || product.images?.[0]
          }}
          onClose={handleModalClose}
          existingReview={editingReview}
          user={user}
        />
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <InquiryFormModal
          product={{
            id: product.id,
            name: product.name || product.title,
            images: typeof product.images === 'string' 
              ? JSON.parse(product.images)
              : product.images,
            category: product.category
          }}
          onClose={() => setShowInquiryModal(false)}
          onSuccess={() => {
            toast.success('Your question will be answered soon!');
          }}
        />
      )}
    </div>
  );
};

export default ProductReviewsSection;
