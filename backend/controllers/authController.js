const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, findUserById } = require('../models/userModel');
const { signToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const role = normalizedEmail === adminEmail ? 'admin' : 'user';

    const userId = await createUser({
      name,
      email: normalizedEmail,
      phone,
      passwordHash,
      role
    });

    const user = await findUserById(userId);
    const token = signToken(user);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  profile
};
