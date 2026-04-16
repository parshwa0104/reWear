import { Star } from 'lucide-react';
import './OwnerMiniCard.css';

export default function OwnerMiniCard({ owner }) {
  if (!owner) return null;

  return (
    <div className="owner-mini-card">
      <div className="owner-avatar">
        {owner.avatar ? (
          <img src={owner.avatar} alt={owner.name} />
        ) : (
          <div className="avatar-placeholder">{owner.name?.charAt(0) || 'U'}</div>
        )}
      </div>
      <div className="owner-info">
        <div className="owner-name body-sm font-semibold">{owner.name}</div>
        <div className="owner-stats flex items-center gap-sm mt-1">
          <span className="flex items-center gap-xs text-xs text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            {owner.rating || 4.5}
          </span>
          {owner.totalRentals !== undefined && (
            <span className="text-xs text-muted">• {owner.totalRentals} rentals</span>
          )}
        </div>
      </div>
    </div>
  );
}
