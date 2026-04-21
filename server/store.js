/**
 * store.js — In-Memory Data Store (No Database)
 * All data lives in RAM. Resets on restart. Perfect for demo/portfolio use.
 *
 * Test Account:
 *   Email:    demo@rewear.com
 *   Password: demo123
 */

const bcrypt = require('bcryptjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

// Pre-computed bcrypt hash for "demo123" (rounds=10)
const DEMO_HASH = bcrypt.hashSync('demo123', 10);

// ─── Raw data arrays (mutated in-place) ───────────────────────────────────────
const _users = [
  {
    id: 'user-demo-1',
    name: 'Priya Sharma',
    email: 'demo@rewear.com',
    password: DEMO_HASH,
    avatar: '',
    location: 'Mumbai, India',
    rating: 4.8,
    totalEarnings: 12500,
    textileWasteSaved: 12.4,
    outfitsListed: 3,
    totalRentals: 18,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'user-demo-2',
    name: 'Arjun Patel',
    email: 'arjun@rewear.com',
    password: DEMO_HASH,
    avatar: '',
    location: 'Delhi, India',
    rating: 4.6,
    totalEarnings: 8200,
    textileWasteSaved: 8.1,
    outfitsListed: 2,
    totalRentals: 12,
    createdAt: now(),
    updatedAt: now()
  }
];

const _outfits = [
  {
    id: 'outfit-1',
    ownerId: 'user-demo-1',
    title: 'Emerald Party Dress',
    description: 'Stunning emerald green cocktail dress, perfect for parties and events. Worn only twice.',
    images: ['/demo/party-dress.jpg'],
    category: 'Party',
    size: 'M',
    brand: 'Zara',
    condition: 'Like New',
    pricePerDay: 399,
    securityDeposit: 800,
    suggestedPrice: 399,
    isAvailable: true,
    location: 'Mumbai, India',
    totalRentals: 8,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'outfit-2',
    ownerId: 'user-demo-2',
    title: 'Classic Denim Jacket',
    description: 'Vintage-style denim jacket, goes with everything. Slightly oversized fit.',
    images: ['/demo/denim-jacket.jpg'],
    category: 'Casual',
    size: 'L',
    brand: "Levi's",
    condition: 'Good',
    pricePerDay: 199,
    securityDeposit: 400,
    suggestedPrice: 199,
    isAvailable: true,
    location: 'Delhi, India',
    totalRentals: 5,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'outfit-3',
    ownerId: 'user-demo-1',
    title: 'Royal Blue Lehenga',
    description: 'Beautiful royal blue lehenga with gold embroidery. Perfect for weddings and festivals.',
    images: ['/demo/lehenga.jpg'],
    category: 'Ethnic',
    size: 'S',
    brand: 'FabIndia',
    condition: 'New',
    pricePerDay: 599,
    securityDeposit: 1500,
    suggestedPrice: 499,
    isAvailable: true,
    location: 'Mumbai, India',
    totalRentals: 3,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'outfit-4',
    ownerId: 'user-demo-2',
    title: 'Urban Streetwear Set',
    description: 'Matching oversized hoodie and cargo pants. Hype beast approved.',
    images: ['/demo/streetwear.jpg'],
    category: 'Streetwear',
    size: 'M',
    brand: 'H&M',
    condition: 'Like New',
    pricePerDay: 299,
    securityDeposit: 600,
    suggestedPrice: 299,
    isAvailable: true,
    location: 'Delhi, India',
    totalRentals: 2,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'outfit-5',
    ownerId: 'user-demo-1',
    title: 'Summer Floral Maxi',
    description: 'Light and breezy floral maxi dress. Perfect for brunches and beach days.',
    images: ['/demo/floral-maxi.jpg'],
    category: 'Casual',
    size: 'M',
    brand: 'Mango',
    condition: 'Good',
    pricePerDay: 249,
    securityDeposit: 500,
    suggestedPrice: 199,
    isAvailable: true,
    location: 'Mumbai, India',
    totalRentals: 6,
    createdAt: now(),
    updatedAt: now()
  }
];

const _reviews = [
  { id: 'rev-1', userId: 'user-demo-2', userName: 'Arjun Patel',   outfitId: 'outfit-1', rating: 5, comment: 'Amazing dress! Fit perfectly.',             createdAt: now() },
  { id: 'rev-2', userId: 'user-demo-1', userName: 'Priya Sharma',  outfitId: 'outfit-1', rating: 4, comment: 'Great quality, fast delivery.',           createdAt: now() },
  { id: 'rev-3', userId: 'user-demo-1', userName: 'Priya Sharma',  outfitId: 'outfit-2', rating: 5, comment: 'Love this jacket! So versatile.',          createdAt: now() },
  { id: 'rev-4', userId: 'user-demo-2', userName: 'Arjun Patel',   outfitId: 'outfit-3', rating: 5, comment: 'Absolutely gorgeous! Worth every penny.',   createdAt: now() },
  { id: 'rev-5', userId: 'user-demo-2', userName: 'Arjun Patel',   outfitId: 'outfit-5', rating: 4, comment: 'Pretty dress, very comfortable.',          createdAt: now() }
];

const _bookings = [];
const _messages = [];

// ─── User helpers ─────────────────────────────────────────────────────────────
const safeUser = (user, opts = {}) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

const withoutPassword = (user) => safeUser(user);

// ─── Store ────────────────────────────────────────────────────────────────────
const db = {
  uuid,
  now,

  users: {
    findByEmail: (email) => _users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,
    findById:    (id)    => _users.find(u => u.id === id) || null,
    emailExists: (email) => _users.some(u => u.email.toLowerCase() === email.toLowerCase()),
    create: (data) => {
      const user = { id: uuid(), ...data, createdAt: now(), updatedAt: now() };
      _users.push(user);
      return user;
    },
    update: (id, data) => {
      const idx = _users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      _users[idx] = { ..._users[idx], ...data, updatedAt: now() };
      return _users[idx];
    },
    safeUser,
    withoutPassword
  },

  outfits: {
    findAll: ({ category, search, minPrice, maxPrice, size } = {}) => {
      let list = _outfits.filter(o => o.isAvailable);
      if (category && category !== 'All') list = list.filter(o => o.category === category);
      if (size) list = list.filter(o => o.size === size);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(o =>
          o.title.toLowerCase().includes(q) ||
          o.brand.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
        );
      }
      if (minPrice) list = list.filter(o => o.pricePerDay >= Number(minPrice));
      if (maxPrice) list = list.filter(o => o.pricePerDay <= Number(maxPrice));
      return list
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(o => ({ ...o, owner: safeUser(db.users.findById(o.ownerId)) }));
    },
    findById: (id) => {
      const o = _outfits.find(o => o.id === id);
      if (!o) return null;
      const reviews = _reviews
        .filter(r => r.outfitId === id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const avgRating = reviews.length
        ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
      const owner = db.users.findById(o.ownerId);
      return { ...o, owner: safeUser(owner), reviews, avgRating };
    },
    findByOwner: (ownerId) => _outfits.filter(o => o.ownerId === ownerId),
    create: (data) => {
      const outfit = { id: uuid(), ...data, totalRentals: 0, createdAt: now(), updatedAt: now() };
      _outfits.push(outfit);
      return outfit;
    },
    update: (id, data) => {
      const idx = _outfits.findIndex(o => o.id === id);
      if (idx === -1) return null;
      _outfits[idx] = { ..._outfits[idx], ...data, updatedAt: now() };
      return _outfits[idx];
    },
    delete: (id, ownerId) => {
      const idx = _outfits.findIndex(o => o.id === id && o.ownerId === ownerId);
      if (idx === -1) return false;
      _outfits.splice(idx, 1);
      return true;
    }
  },

  reviews: {
    create: (data) => {
      const review = { id: uuid(), ...data, createdAt: now() };
      _reviews.push(review);
      return review;
    }
  },

  bookings: {
    create: (data) => {
      const booking = { id: uuid(), ...data, createdAt: now(), updatedAt: now() };
      _bookings.push(booking);
      return booking;
    },
    findById: (id) => _bookings.find(b => b.id === id) || null,
    findByRenter: (renterId) =>
      _bookings
        .filter(b => b.renterId === renterId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => ({
          ...b,
          outfit: _outfits.find(o => o.id === b.outfitId) || null,
          owner:  safeUser(db.users.findById(b.ownerId))
        })),
    findByOwner: (ownerId) =>
      _bookings
        .filter(b => b.ownerId === ownerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(b => ({
          ...b,
          outfit: _outfits.find(o => o.id === b.outfitId) || null,
          renter: safeUser(db.users.findById(b.renterId))
        })),
    update: (id, data) => {
      const idx = _bookings.findIndex(b => b.id === id);
      if (idx === -1) return null;
      _bookings[idx] = { ..._bookings[idx], ...data, updatedAt: now() };
      return _bookings[idx];
    }
  },

  messages: {
    create: (data) => {
      const msg = { id: uuid(), ...data, isRead: false, createdAt: now(), updatedAt: now() };
      _messages.push(msg);
      return msg;
    },
    findConversation: (outfitId, userA, userB) =>
      _messages
        .filter(m =>
          m.outfitId === outfitId &&
          ((m.senderId === userA && m.receiverId === userB) ||
           (m.senderId === userB && m.receiverId === userA))
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(m => ({
          ...m,
          sender:   safeUser(db.users.findById(m.senderId)),
          receiver: safeUser(db.users.findById(m.receiverId))
        })),
    markRead: (outfitId, senderId, receiverId) => {
      _messages.forEach(m => {
        if (m.outfitId === outfitId && m.senderId === senderId && m.receiverId === receiverId) {
          m.isRead = true;
        }
      });
    },
    findThreads: (userId) => {
      const seen = new Set();
      return _messages
        .filter(m => m.senderId === userId || m.receiverId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter(m => { if (seen.has(m.outfitId)) return false; seen.add(m.outfitId); return true; })
        .map(m => ({
          ...m,
          sender:   safeUser(db.users.findById(m.senderId)),
          receiver: safeUser(db.users.findById(m.receiverId)),
          outfit:   _outfits.find(o => o.id === m.outfitId) || null
        }));
    }
  }
};

module.exports = db;
