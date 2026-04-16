import { useEffect, useState } from 'react';
import { LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('closet');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (activeTab === 'closet') fetchListings();
      if (activeTab === 'rentals') fetchRentals();
    }
  }, [activeTab, user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/outfits/user/${user.id}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-rentals');
      // Format to look like outfit cards
      setItems(res.data.map(b => ({ ...b.outfit, bookingId: b.id, id: b.outfit.id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getImageFromItem = (item) => {
    if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
    if (typeof item.images === 'string') {
      try {
        const maybeImages = JSON.parse(item.images);
        if (Array.isArray(maybeImages) && maybeImages.length > 0) return maybeImages[0];
      } catch {
        return 'https://via.placeholder.com/300x360?text=ReWear';
      }
    }
    return 'https://via.placeholder.com/300x360?text=ReWear';
  };

  return (
    <div className="page bg-primary min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="profile-topbar flex justify-between items-center p-md">
        <div>
          <p className="profile-chip">MY ACCOUNT</p>
          <h1 className="heading-md">Profile</h1>
        </div>
        <button onClick={logout} className="text-secondary hover:text-coral transition-colors" title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="px-md mt-sm profile-shell">
        {/* User Card */}
        <div className="profile-user-card flex items-center gap-md mb-xl animate-slide-up">
          <div className="w-20 h-20 rounded-full border-2 border-purple bg-card flex items-center justify-center text-2xl font-bold text-purple overflow-hidden">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div>
            <h2 className="heading-md">{user.name}</h2>
            <div className="flex gap-sm text-sm text-secondary mt-1">
              <span>{user.location}</span>
              <span>•</span>
              <span className="text-yellow-400">★ {user.rating}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-sm mb-lg animate-slide-up delay-100 profile-stats">
          <div className="bg-card border border-subtle rounded-lg p-sm text-center">
            <div className="heading-sm mb-1">{user.outfitsListed}</div>
            <div className="text-xs text-secondary">Listed</div>
          </div>
          <div className="bg-card border border-subtle rounded-lg p-sm text-center">
            <div className="heading-sm mb-1 pr-1">₹{user.totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-secondary">Earned</div>
          </div>
          <div className="bg-card border border-subtle rounded-lg p-sm text-center">
            <div className="heading-sm mb-1">{user.totalRentals}</div>
            <div className="text-xs text-secondary">Rentals</div>
          </div>
        </div>

        {/* Sustainability Badge */}
        <div className="eco-badge animate-float bg-green/10 border border-green text-green rounded-lg p-md mb-xl flex items-center gap-md">
          <div className="bg-green text-primary p-2 rounded-full">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="font-bold text-sm mb-0.5">Eco Warrior</div>
            <div className="text-xs">You've saved {user.textileWasteSaved}kg of textile waste! 🌱</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-subtle mb-md animate-fade-in delay-200">
          <button 
            className={`tab-btn ${activeTab === 'closet' ? 'active' : ''}`}
            onClick={() => setActiveTab('closet')}
          >
            My Closet
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            My Rentals
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid-2-col gap-sm pb-24 animate-fade-in delay-300">
          {loading ? (
             [1,2].map(i => <div key={i} className="skeleton h-40 bg-card rounded-md"></div>)
          ) : items.length === 0 ? (
            <div className="col-span-2 text-center py-xl text-muted">
              Nothing to show here yet.
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="bg-card rounded-md border border-subtle overflow-hidden text-sm profile-item-card">
                <img src={getImageFromItem(item)} className="w-full h-32 object-cover" />
                <div className="p-sm">
                  <div className="font-semibold truncate">{item.title}</div>
                  <div className="text-green font-semibold mt-1">₹{item.pricePerDay}/d</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
