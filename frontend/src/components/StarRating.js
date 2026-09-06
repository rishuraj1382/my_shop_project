// frontend/src/components/StarRating.js
import React from 'react';

/**
 * StarRating component
 * @param {number} rating - current rating (0-5)
 * @param {number} totalReviews - total review count to display
 * @param {boolean} interactive - if true, renders clickable stars
 * @param {function} onRate - callback(rating) when a star is clicked
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
function StarRating({ rating = 0, totalReviews, interactive = false, onRate, size = 'md' }) {
  const [hovered, setHovered] = React.useState(0);

  const sizeMap = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
  };

  const stars = [1, 2, 3, 4, 5];
  const displayRating = hovered || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.floor(displayRating);
          const halfFilled = !filled && star <= displayRating + 0.5;
          return (
            <span
              key={star}
              className={`${sizeMap[size]} transition-all duration-150 ${
                interactive ? 'cursor-pointer select-none' : ''
              } ${
                filled
                  ? 'text-tertiary'
                  : halfFilled
                  ? 'text-tertiary/70'
                  : 'text-outline-variant'
              }`}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(0)}
              onClick={() => interactive && onRate && onRate(star)}
              onKeyDown={(e) => {
                if (!interactive) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRate && onRate(star);
                }
              }}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? `Rate ${star} stars` : undefined}
            >
              ★
            </span>
          );
        })}
      </div>
      {rating > 0 && (
        <span className={`font-bold text-on-surface ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className={`text-on-surface-variant ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}

export default StarRating;
