const User = require('../models/User');
const { signToken } = require('../utils/token');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password,
      provider: 'local',
    });
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

function googleCallback(req, res) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!req.user) {
    return res.redirect(`${frontend}/oauth-success?error=auth_failed`);
  }
  const token = signToken(req.user);
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  return res.redirect(`${frontend}/oauth-success?token=${encodeURIComponent(token)}`);
}

module.exports = { register, login, me, updateProfile, googleCallback };
