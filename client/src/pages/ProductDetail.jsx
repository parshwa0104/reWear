import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, ShieldCheck, MapPin } from 'lucide-react';
import api from '../utils/api';
import OwnerMiniCard from '../components/OwnerMiniCard';
import ReviewCard from '../components/ReviewCard';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfit = async () => {
      try {
        const res = await api.get(`/outfits/${id}`);
        setOutfit(res.data);
      } catch (err) {
        console.error('Failed to load outfit', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutfit();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!outfit) return <div className="text-center mt-xl">Outfit not found</div>;

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

  const imageUrl = parsedImages.length > 0
    ? parsedImages[0]
    : `https://ui-avatars.com/api/?name=${outfit.title}&background=2a2a3e&color=fff&size=800`;

  const handleRentClick = () => {
    navigate(`/booking/${outfit.id}`, { state: { outfit } });
  };

  const handleChatClick = () => {
    navigate(`/chat/${outfit.id}`);
  };

  return (
    <div className="product-page bg-primary min-h-screen pb-24">
      <Navbar />

      {/* Header Nav */}
      <div className="fixed-top-nav flex justify-between items-center px-md py-sm z-50">
        <button className="nav-circle-btn glass" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="nav-circle-btn glass">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Image */}
      <div className="hero-image-container mb-md">
        <img src={imageUrl} alt={outfit.title} className="hero-image" />
        <div className="hero-gradient"></div>
        <div className="price-tag-large animate-slide-up">
          <span className="text-sm font-normal mr-1">₹</span>
          <span className="heading-md">{outfit.pricePerDay}</span>
          <span className="text-xs font-normal opacity-80 mt-1">/day</span>
        </div>
      </div>

      <div className="container px-md pb-xl">
        {/* Title & Badges */}
        <div className="animate-fade-in-up product-copy-block">
          <h1 className="heading-lg">{outfit.title}</h1>
          <div className="product-tags flex gap-sm flex-wrap">
            <span className="badge badge-outline">{outfit.category}</span>
            <span className="badge badge-outline">Size {outfit.size}</span>
            <span className="badge badge-outline">{outfit.brand}</span>
            <span className="badge badge-outline">{outfit.condition}</span>
          </div>

          <p className="body-md text-secondary leading-relaxed product-desc">
            {outfit.description || 'No description provided.'}
          </p>
        </div>

        {/* Security Info Card */}
        <div className="info-card glass mb-xl animate-fade-in-up delay-100">
          <div className="flex items-center gap-md mb-sm">
            <div className="icon-box bg-green/10 text-green rounded-full p-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold body-md">Security Deposit</div>
              <div className="text-sm text-secondary">₹{outfit.securityDeposit} (Fully refundable)</div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="icon-box bg-purple/10 text-purple rounded-full p-2">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold body-md">Location</div>
              <div className="text-sm text-secondary">{outfit.location}</div>
            </div>
          </div>
        </div>

        {/* Owner Mini Card */}
        <div className="mb-xl animate-fade-in-up delay-200">
          <h3 className="heading-sm mb-sm text-muted">Owned by</h3>
          <OwnerMiniCard owner={outfit.owner} />
        </div>

        {/* Reviews Section */}
        {outfit.reviews && outfit.reviews.length > 0 && (
          <div className="mb-xl animate-fade-in-up delay-300">
             <div className="flex justify-between items-end mb-sm">
              <h3 className="heading-sm">Reviews ({outfit.reviews.length})</h3>
              <span className="text-sm text-green font-semibold">{outfit.avgRating} ★</span>
            </div>
            <div className="flex flex-col gap-sm">
              {outfit.reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="bottom-action-bar">
        <div className="container flex gap-md px-md items-center h-full">
          <button className="btn btn-purple flex-1" onClick={handleChatClick}>
            Chat Owner
          </button>
          <button className="btn btn-green flex-[2]" onClick={handleRentClick}>
            Rent Now
          </button>
        </div>
      </div>
    </div>
  );
}
