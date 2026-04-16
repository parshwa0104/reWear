import { Star } from 'lucide-react';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  // Format date loosely
  const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  return (
    <div className="review-card">
      <div className="flex justify-between items-start">
        <div className="review-user-info flex items-center gap-sm">
          <div className="review-avatar">
            {review.userName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="body-sm font-semibold">{review.userName}</div>
            <div className="text-xs text-muted">{dateStr}</div>
          </div>
        </div>
        <div className="stars">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-muted'}`} 
            />
          ))}
        </div>
      </div>
      <p className="review-comment body-sm mt-2 text-secondary">
        "{review.comment}"
      </p>
    </div>
  );
}
