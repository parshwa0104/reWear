require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server/no-origin requests and localhost dev ports.
    if (!origin) return callback(null, true);

    const isLocalhost = /^https?:\/\/localhost:\d+$/i.test(origin);
    if (isLocalhost) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ReWear API (SQLite)', timestamp: new Date().toISOString() });
});

// Seed demo data
async function seedData() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('📦 Database already has data, skipping seed.');
    return;
  }

  console.log('🌱 Seeding demo data into SQLite...');

  const passwordHash = await bcrypt.hash('demo123', 12);

  // Create demo users
  const user1 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@rewear.com',
      password: passwordHash,
      location: 'Mumbai, India',
      rating: 4.8,
      totalEarnings: 12500,
      textileWasteSaved: 12.4,
      outfitsListed: 3,
      totalRentals: 18
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Arjun Patel',
      email: 'arjun@rewear.com',
      password: passwordHash,
      location: 'Delhi, India',
      rating: 4.6,
      totalEarnings: 8200,
      textileWasteSaved: 8.1,
      outfitsListed: 2,
      totalRentals: 12
    }
  });

  // Create demo outfits
  const outfits = [
    {
      ownerId: user1.id,
      title: 'Emerald Party Dress',
      description: 'Stunning emerald green cocktail dress, perfect for parties and events. Worn only twice.',
      images: JSON.stringify(['/demo/party-dress.jpg']),
      category: 'Party',
      size: 'M',
      brand: 'Zara',
      condition: 'Like New',
      pricePerDay: 399,
      securityDeposit: 800,
      suggestedPrice: 399,
      location: 'Mumbai, India',
      reviews: {
        create: [
          { userId: user2.id, userName: 'Arjun Patel', rating: 5, comment: 'Amazing dress! Fit perfectly.' },
          { userId: user1.id, userName: 'Priya Sharma', rating: 4, comment: 'Great quality, fast delivery.' }
        ]
      }
    },
    {
      ownerId: user2.id,
      title: 'Classic Denim Jacket',
      description: 'Vintage-style denim jacket, goes with everything. Slightly oversized fit.',
      images: JSON.stringify(['/demo/denim-jacket.jpg']),
      category: 'Casual',
      size: 'L',
      brand: 'Levi\'s',
      condition: 'Good',
      pricePerDay: 199,
      securityDeposit: 400,
      suggestedPrice: 199,
      location: 'Delhi, India',
      reviews: {
        create: [
          { userId: user1.id, userName: 'Priya Sharma', rating: 5, comment: 'Love this jacket! So versatile.' }
        ]
      }
    },
    {
      ownerId: user1.id,
      title: 'Royal Blue Lehenga',
      description: 'Beautiful royal blue lehenga with gold embroidery. Perfect for weddings and festivals.',
      images: JSON.stringify(['/demo/lehenga.jpg']),
      category: 'Ethnic',
      size: 'S',
      brand: 'FabIndia',
      condition: 'New',
      pricePerDay: 599,
      securityDeposit: 1500,
      suggestedPrice: 499,
      location: 'Mumbai, India',
      reviews: {
        create: [
          { userId: user2.id, userName: 'Arjun Patel', rating: 5, comment: 'Absolutely gorgeous! Worth every penny.' }
        ]
      }
    },
    {
      ownerId: user2.id,
      title: 'Urban Streetwear Set',
      description: 'Matching oversized hoodie and cargo pants. Hype beast approved.',
      images: JSON.stringify(['/demo/streetwear.jpg']),
      category: 'Streetwear',
      size: 'M',
      brand: 'H&M',
      condition: 'Like New',
      pricePerDay: 299,
      securityDeposit: 600,
      suggestedPrice: 299,
      location: 'Delhi, India',
    },
    {
      ownerId: user1.id,
      title: 'Summer Floral Maxi',
      description: 'Light and breezy floral maxi dress. Perfect for brunches and beach days.',
      images: JSON.stringify(['/demo/floral-maxi.jpg']),
      category: 'Casual',
      size: 'M',
      brand: 'Mango',
      condition: 'Good',
      pricePerDay: 249,
      securityDeposit: 500,
      suggestedPrice: 199,
      location: 'Mumbai, India',
      reviews: {
        create: [
          { userId: user2.id, userName: 'Arjun Patel', rating: 4, comment: 'Pretty dress, very comfortable.' }
        ]
      }
    }
  ];

  for (const outfit of outfits) {
    await prisma.outfit.create({ data: outfit });
  }

  console.log('✅ Demo data seeded: 2 users, 5 outfits');
}

// Start server
seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ReWear API running on http://localhost:${PORT} 🌿`);
  });
}).catch(err => {
  console.error('❌ Server start error:', err);
  process.exit(1);
});
