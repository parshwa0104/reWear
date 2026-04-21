const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../store');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (db.users.emailExists(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = db.users.create({
      name,
      email,
      password: hashedPassword,
      avatar: '',
      location: location || 'Mumbai, India',
      rating: 4.5,
      totalEarnings: 0,
      textileWasteSaved: 0,
      outfitsListed: 0,
      totalRentals: 0
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'rewear-secret-key', { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: db.users.withoutPassword(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'rewear-secret-key', { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user: db.users.withoutPassword(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, (req, res) => {
  const user = db.users.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(db.users.withoutPassword(user));
});

// Get user by ID (public profile)
router.get('/:id', (req, res) => {
  const user = db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(db.users.withoutPassword(user));
});

// Update profile
router.put('/me', auth, (req, res) => {
  const allowed = ['name', 'avatar', 'location'];
  const data = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  });

  const updated = db.users.update(req.userId, data);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(db.users.withoutPassword(updated));
});

module.exports = router;
