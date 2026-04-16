import './CategoryScroll.css';

export default function CategoryScroll({ activeCategory, onSelect }) {
  const categories = ['All', 'Casual', 'Party', 'Ethnic', 'Streetwear'];

  return (
    <div className="category-scroll-container">
      <div className="category-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
