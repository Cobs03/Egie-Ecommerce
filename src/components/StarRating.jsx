import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * StarRating Component - Display-only star rating
 * Shows 1-5 stars with half-star support
 * 
 * @param {number} rating - Rating value (0-5, supports decimals)
 * @param {number} size - Star size in pixels (default: 16)
 * @param {boolean} showNumber - Show numeric rating next to stars (default: false)
 */
const StarRating = ({ rating = 0, size = 16, showNumber = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} className="text-yellow-400" />
      ))}
      
      {/* Half star */}
      {hasHalfStar && <FaStarHalfAlt size={size} className="text-yellow-400" />}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
      
      {/* Optional numeric rating */}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
