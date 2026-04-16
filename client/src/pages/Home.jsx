import { useState, useEffect } from 'react';
import { Search, Flame, Sparkles, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import CategoryScroll from '../components/CategoryScroll';
import OutfitCard from '../components/OutfitCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

export default function Home() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOutfits();
  }, [category]);

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const url = category === 'All' ? '/outfits' : `/outfits?category=${category}`;
      const res = await api.get(url);
      setOutfits(res.data);
    } catch (error) {
      console.error('Failed to fetch outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOutfits = outfits.filter(o => 
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page retail-page">
      <Navbar />

      <div className="promo-strip">
        <Sparkles className="promo-icon" />
        <span>Flat 15% off first rental • Free pickup in selected cities</span>
      </div>

      <div className="home-shell">
        <section className="hero-banner">
          <div>
            <p className="hero-tag">CURATED FESTIVE + DAILY EDITS</p>
            <h1>Rent fashion, not clutter.</h1>
            <p className="hero-sub">
              Discover premium outfits inspired by everyday elegance — from party glam to simple ethnic staples.
            </p>
            <button type="button" className="hero-cta">
              Explore collection <ArrowRight size={16} />
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>2K+</strong>
              <span>Rentals served</span>
            </div>
            <div>
              <strong>4.8★</strong>
              <span>Style rating</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>Avg. dispatch</span>
            </div>
          </div>
        </section>

        <section className="home-filter-wrap">
          <div className="search-bar">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by outfit, occasion, brand..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CategoryScroll activeCategory={category} onSelect={setCategory} />
        </section>

        <section className="listing-head">
          <div>
            <h2>Trending rentals</h2>
            <p>{filteredOutfits.length} styles found</p>
          </div>
          <div className="eco-chip">
            <Flame size={14} />
            <span>Sustainable picks</span>
          </div>
        </section>

        <div>
          {loading ? (
            <div className="home-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '320px' }} />
              ))}
            </div>
          ) : filteredOutfits.length === 0 ? (
            <div className="text-center py-xl text-muted animate-fade-in">
              <p>No outfits found in this category.</p>
            </div>
          ) : (
            <div className="home-grid pb-xl">
              {filteredOutfits.map(outfit => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
