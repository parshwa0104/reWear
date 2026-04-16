import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import './OutfitCard.css';

export default function OutfitCard({ outfit }) {
  let parsedImages = [];

  if (Array.isArray(outfit.images)) {
    parsedImages = outfit.images;
  } else if (typeof outfit.images === 'string') {
    try {
      const maybeImages = JSON.parse(outfit.images);
      parsedImages = Array.isArray(maybeImages) ? maybeImages : [];
    } catch {
      parsedImages = [];
    }
  }

  // Use placeholder image if no images exist
  const imageUrl = parsedImages.length > 0
    ? parsedImages[0]
    : `https://ui-avatars.com/api/?name=${outfit.title}&background=2a2a3e&color=fff&size=400`;

  return (
    <Link to={`/outfit/${outfit.id}`} className="outfit-card animate-fade-in-up">
      <div className="outfit-image-container">
        <img src={imageUrl} alt={outfit.title} className="outfit-image" />
        <div className="outfit-price-badge">
          ₹{outfit.pricePerDay}/day
        </div>
      </div>
      
      <div className="outfit-content">
        <p className="outfit-brand">{outfit.brand || 'Styled by ReWear'}</p>

        <div className="outfit-header">
          <h3 className="body-md font-semibold truncate">{outfit.title}</h3>
          <div className="outfit-rating">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{outfit.owner?.rating || 4.5}</span>
          </div>
        </div>
        
        <div className="outfit-meta text-xs text-muted">
          <span>{outfit.size} • {outfit.category}</span>
          <span className="outfit-loc">
            <MapPin className="w-3 h-3" />
            {outfit.owner?.location?.split(',')[0] || 'Local'}
          </span>
        </div>
      </div>
    </Link>
  );
}
