require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  /^https?:\/\/localhost:\d+$/,           // local dev
  /^https:\/\/.*\.vercel\.app$/,          // any Vercel preview/production URL
  process.env.FRONTEND_URL                // explicit prod domain env var (optional)
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server / curl
    const ok = allowedOrigins.some(p =>
      typeof p === 'string' ? origin === p : p.test(origin)
    );
    if (ok) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users',    require('./routes/users'));
app.use('/api/outfits',  require('./routes/outfits'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ReWear API (in-memory)', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ReWear API running on http://localhost:${PORT} 🌿`);
  console.log(`📦 Using in-memory store — no database required`);
  console.log(`🔑 Test login: demo@rewear.com / demo123`);
});

module.exports = app;