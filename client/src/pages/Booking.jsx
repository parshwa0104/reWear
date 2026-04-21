import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import './Booking.css';

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const outfit = location.state?.outfit;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const parseImages = (images) => {
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Fallback if accessed directly
  if (!outfit) {
    navigate(-1);
    return null;
  }

  // Calculate totals
  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const days = getDays();
  const rentTotal = days * outfit.pricePerDay;
  const deposit = outfit.securityDeposit;
  const total = rentTotal + deposit;

  const handleSubmit = async () => {
    if (days <= 0) return;
    setLoading(true);
    try {
      await api.post('/bookings', {
        outfitId: id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile'); // Go to profile to see rentals
      }, 3000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Booking failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary px-xl text-center">
        <div className="confetti-container">
          <div className="confetti text-green">✨</div>
          <div className="confetti text-purple" style={{animationDelay: '0.2s', left: '10%'}}>🎊</div>
          <div className="confetti text-green" style={{animationDelay: '0.4s', left: '80%'}}>🎉</div>
        </div>
        <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mb-md animate-scale-in">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="heading-lg mb-sm animate-fade-in-up delay-100">Outfit Booked!</h2>
        <p className="text-secondary body-md animate-fade-in-up delay-200 text-balance">
          The owner will be notified. Pick up your outfit on {new Date(startDate).toLocaleDateString()}.
        </p>
      </div>
    );
  }

  const outfitImages = parseImages(outfit.images);
  const outfitImage = outfitImages[0] || 'https://via.placeholder.com/220x280?text=ReWear';

  return (
    <div className="page bg-primary min-h-screen booking-page">
      {/* Header View */}
      <div className="flex items-center p-md border-b border-subtle booking-header">
        <button className="nav-circle-btn" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="heading-sm ml-sm flex-1 text-center pr-10">Confirm Booking</h1>
      </div>

      <div className="px-md py-lg booking-shell">
        {/* Outfit summary */}
        <div className="booking-summary animate-slide-up">
          <img 
            src={outfitImage}
            alt="Outfit"
            className="booking-summary-image"
          />
          <div className="booking-summary-content">
            <h3 className="booking-summary-title line-clamp-1">{outfit.title}</h3>
            <p className="booking-summary-meta">{outfit.brand} • Size {outfit.size}</p>
            <p className="booking-summary-price">₹{outfit.pricePerDay}/day</p>
          </div>
        </div>

        {/* Date Selection */}
        <h3 className="heading-sm mb-md animate-fade-in delay-100">Select Dates</h3>
        <div className="grid grid-cols-2 gap-md mb-xl animate-fade-in delay-100 booking-date-grid">
          <div className="input-group">
            <label>Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input 
                type="date" 
                className="input w-full pl-10" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="input-group">
            <label>End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input 
                type="date" 
                className="input w-full pl-10" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <h3 className="heading-sm mb-md animate-fade-in delay-200">Price Details</h3>
        <div className="bg-card border border-subtle rounded-lg p-md mb-xl animate-fade-in delay-200">
          <div className="flex justify-between mb-sm text-secondary">
            <span>₹{outfit.pricePerDay} x {days} days</span>
            <span>₹{rentTotal}</span>
          </div>
          <div className="flex justify-between mb-sm pb-sm border-b border-subtle text-secondary">
            <span className="flex items-center gap-xs">
              Security Deposit <ShieldAlert className="w-3 h-3 text-purple" />
            </span>
            <span>₹{deposit}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total Payable</span>
            <span className="text-green">₹{total}</span>
          </div>
          
          <div className="mt-md p-sm bg-purple/10 text-purple text-xs rounded-md">
            The security deposit of ₹{deposit} is fully refundable when the outfit is returned in good condition.
          </div>
        </div>

        <button 
          className="btn btn-green btn-full btn-lg mb-xl animate-fade-in delay-300"
          onClick={handleSubmit}
          disabled={loading || days <= 0}
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
