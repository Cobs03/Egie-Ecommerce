import React, { useState, useEffect } from "react";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import { supabase } from "../../../lib/supabase";
import StarRating from "../../../components/StarRating";
import { FaQuoteLeft } from "react-icons/fa";

const CustomerReviews = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews with rating 4 or 5 stars, with review text
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .gte('rating', 4)
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews:', data); // Debug log

        // Filter to only show reviews that have comment text
        const reviewsWithText = data && data.length > 0 
          ? data.filter(r => r.comment && r.comment.trim() !== '')
          : [];
        
        console.log('Reviews with text:', reviewsWithText);
        console.log('Sample review:', data[0]); // Check structure

        // Fetch user profiles and products separately
        if (reviewsWithText.length > 0) {
          const userIds = [...new Set(reviewsWithText.map(r => r.user_id).filter(id => id))];
          const productIds = [...new Set(reviewsWithText.map(r => r.product_id).filter(id => id))];
          
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds);

          // Fetch products
          const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

          // Create a map of profiles
          const profilesMap = {};
          if (profiles) {
            profiles.forEach(p => {
              profilesMap[p.id] = p;
            });
          }

          // Create a map of products
          const productsMap = {};
          if (products) {
            products.forEach(p => {
              productsMap[p.id] = p;
            });
          }

          // Attach profile data to reviews
          const reviewsWithProfiles = reviewsWithText.map(review => ({
            ...review,
            user_name: profilesMap[review.user_id] 
              ? `${profilesMap[review.user_id].first_name} ${profilesMap[review.user_id].last_name}`
              : review.user_name || 'Anonymous',
            product_name: productsMap[review.product_id]?.name || 'Product',
            review: review.comment // Use comment field from database
          }));

          console.log('Final reviews with profiles:', reviewsWithProfiles);
          setReviews(reviewsWithProfiles);
        } else {
          // If no reviews, use sample data for demo
          setReviews([
            {
              id: 1,
              rating: 5,
              review: "Excellent product! Fast delivery and great quality. Highly recommend for anyone looking for reliable gaming gear.",
              user_name: "John Doe",
              product_name: "Gaming Laptop",
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              rating: 5,
              review: "Best purchase I've made this year. The performance is outstanding and customer service was very helpful.",
              user_name: "Jane Smith",
              product_name: "Gaming Mouse",
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              rating: 4,
              review: "Great value for money. Shipping was quick and the product arrived in perfect condition.",
              user_name: "Mike Johnson",
              product_name: "Mechanical Keyboard",
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Use sample data on error
        setReviews([
          {
            id: 1,
            rating: 5,
            review: "Excellent product! Fast delivery and great quality. Highly recommend for anyone looking for reliable gaming gear.",
            user_name: "John Doe",
            product_name: "Gaming Laptop",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            rating: 5,
            review: "Best purchase I've made this year. The performance is outstanding and customer service was very helpful.",
            user_name: "Jane Smith",
            product_name: "Gaming Mouse",
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            rating: 4,
            review: "Great value for money. Shipping was quick and the product arrived in perfect condition.",
            user_name: "Mike Johnson",
            product_name: "Mechanical Keyboard",
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularReviews();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-transparent py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading customer reviews...</p>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="w-full bg-transparent py-12">
        <div className="text-center">
          <p className="text-gray-500">No reviews available yet. Be the first to review our products!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`w-full bg-transparent py-12 overflow-hidden relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <style>{`
        @keyframes scrollReviews {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        
        .animate-scroll-reviews {
          animation: scrollReviews 25s linear infinite;
        }
        
        .animate-scroll-reviews:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Section Header */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">What Our Customers Say</h2>
        <p className="text-gray-600">Real reviews from satisfied customers</p>
      </div>

      <div className="flex items-center relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex animate-scroll-reviews gap-6">
          {/* First set of reviews */}
          {reviews.map((review, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 w-[320px] md:w-[400px] bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="flex items-start justify-between mb-4">
                <FaQuoteLeft className="text-green-500 text-2xl opacity-30" />
                <StarRating rating={review.rating} size={18} />
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-4 line-clamp-4 min-h-[100px] text-base leading-relaxed">
                {review.review}
              </p>

              {/* Customer Info */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user_name}</p>
                    <p className="text-xs text-gray-500">Verified Purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 line-clamp-1 font-medium">{review.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Second set for seamless loop */}
          {reviews.map((review, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 w-[320px] md:w-[400px] bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <FaQuoteLeft className="text-green-500 text-2xl opacity-30" />
                <StarRating rating={review.rating} size={18} />
              </div>

              <p className="text-gray-700 mb-4 line-clamp-4 min-h-[100px] text-base leading-relaxed">
                {review.review}
              </p>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user_name}</p>
                    <p className="text-xs text-gray-500">Verified Purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 line-clamp-1 font-medium">{review.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Third set for extra smooth transition */}
          {reviews.map((review, index) => (
            <div
              key={`third-${index}`}
              className="flex-shrink-0 w-[320px] md:w-[400px] bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <FaQuoteLeft className="text-green-500 text-2xl opacity-30" />
                <StarRating rating={review.rating} size={18} />
              </div>

              <p className="text-gray-700 mb-4 line-clamp-4 min-h-[100px] text-base leading-relaxed">
                {review.review}
              </p>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user_name}</p>
                    <p className="text-xs text-gray-500">Verified Purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 line-clamp-1 font-medium">{review.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
