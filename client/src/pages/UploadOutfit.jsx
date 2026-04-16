import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './UploadOutfit.css';

export default function UploadOutfit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Casual',
    size: 'M',
    brand: '',
    condition: 'Good',
    pricePerDay: '',
    description: '',
    location: 'Mumbai, India'
  });

  const [suggestedPrice, setSuggestedPrice] = useState(0);

  // Auto-suggest price when category changes
  const handleCategoryChange = async (e) => {
    const cat = e.target.value;
    setFormData({ ...formData, category: cat });
    try {
      const res = await api.get(`/outfits/suggest-price/${cat}`);
      setSuggestedPrice(res.data.suggestedPrice);
      if (!formData.pricePerDay) {
        setFormData(prev => ({ ...prev, pricePerDay: res.data.suggestedPrice }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, we'd upload the image file to AWS S3 / Cloudinary here
      // For prototype, we'll just send the form data and backend uses default structure
      const res = await api.post('/outfits', formData);
      setToast({ message: res.data.message || 'Outfit listed! 🌿', type: 'success' });
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Upload failed', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="page pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="px-md py-lg">
        <h1 className="heading-lg mb-xl animate-fade-in-down">List an Outfit</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg animate-slide-up delay-100">
          {/* Image Upload Zone */}
          <div className="image-upload-zone">
            <div className="flex flex-col items-center justify-center h-full text-secondary">
              <Camera className="w-10 h-10 mb-sm" />
              <p className="font-semibold mb-1">Tap to add photos</p>
              <p className="text-xs opacity-70">Show off the fit, the details, and any tags</p>
            </div>
          </div>

          <div className="input-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title"
              className="input" 
              placeholder="e.g., Zara Black Evening Dress"
              value={formData.title}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>Category</label>
              <select name="category" className="select" value={formData.category} onChange={handleCategoryChange}>
                <option>Casual</option>
                <option>Party</option>
                <option>Ethnic</option>
                <option>Streetwear</option>
              </select>
            </div>
            <div className="input-group">
              <label>Size</label>
              <select name="size" className="select" value={formData.size} onChange={handleInputChange}>
                <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>Brand</label>
              <input type="text" name="brand" className="input" placeholder="e.g., H&M" value={formData.brand} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Condition</label>
              <select name="condition" className="select" value={formData.condition} onChange={handleInputChange}>
                <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
              </select>
            </div>
          </div>

          <div className="input-group relative">
            <label>Price per day (₹)</label>
            <input 
              type="number" 
              name="pricePerDay"
              className="input text-lg font-bold" 
              placeholder="0"
              value={formData.pricePerDay}
              onChange={handleInputChange}
              required 
            />
            {suggestedPrice > 0 && (
              <div className="suggested-price-chip animate-fade-in">
                <Sparkles className="w-3 h-3 text-purple" />
                AI Hint: ₹{suggestedPrice}/day
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea 
              name="description"
              className="input" 
              placeholder="Tell us about the fabric, fit, and styling tips..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-green btn-full btn-lg mt-md mb-xl"
            disabled={loading}
          >
            {loading ? 'Listing...' : 'List Outfit'}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
}
