import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

/**
 * StarRatingInput Component - Interactive star rating selector
 * Used in review forms to select 1-5 stars
 * 
 * @param {number} value - Current rating value (1-5)
 * @param {function} onChange - Callback when rating changes
 * @param {number} size - Star size in pixels (default: 24)
 * @param {boolean} required - Is rating required (default: true)
 */
const StarRatingInput = ({ value = 0, onChange, size = 24, required = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (star) => {
    onChange(star);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            {star <= (hoverRating || value) ? (
              <FaStar size={size} className="text-yellow-400" />
            ) : (
              <FaRegStar size={size} className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
      
      {/* Rating labels */}
      <div className="flex items-center gap-2">
        {value > 0 && (
          <span className="text-sm text-gray-600">
            {value === 1 && 'Poor'}
            {value === 2 && 'Fair'}
            {value === 3 && 'Good'}
            {value === 4 && 'Very Good'}
            {value === 5 && 'Excellent'}
          </span>
        )}
        {required && value === 0 && (
          <span className="text-xs text-red-500">* Required</span>
        )}
      </div>
    </div>
  );
};

export default StarRatingInput;
