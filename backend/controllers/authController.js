const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, findUserByPhone, findUserById, updateLoginStats, incrementFailedAttempts } = require('../models/userModel');
const { logAuthEvent, createOtp, verifyOtp } = require('../models/authModel');
const { signToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      await logAuthEvent({
        eventType: 'signup_fail',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'fail',
        deviceInfo: { email: normalizedEmail, reason: 'duplicate_email' }
      });
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

    await logAuthEvent({
      userId,
      eventType: 'signup_success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
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
    const { identifier, password } = req.body;
    const normalizedId = identifier.toLowerCase();
    
    let user = await findUserByEmail(normalizedId);
    if (!user) {
      user = await findUserByPhone(identifier);
    }

    if (!user) {
      await logAuthEvent({
        eventType: 'login_fail',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'fail',
        deviceInfo: { identifier, reason: 'user_not_found' }
      });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check for temporary lockout
    if (user.is_blocked && user.blocked_until && new Date(user.blocked_until) > new Date()) {
      const waitTime = Math.ceil((new Date(user.blocked_until) - new Date()) / 60000);
      await logAuthEvent({
        userId: user.id,
        eventType: 'login_blocked',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'blocked'
      });
      return res.status(403).json({ message: `Account locked. Try again in ${waitTime} minutes.` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      await incrementFailedAttempts(user.email);
      await logAuthEvent({
        userId: user.id,
        eventType: 'login_fail',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'fail',
        deviceInfo: { identifier, reason: 'wrong_password' }
      });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    await updateLoginStats(user.id);
    await logAuthEvent({
      userId: user.id,
      eventType: 'login_success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    return next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await createOtp({ mobile, code });

    console.log(`[FINTECH-AUTH] Generated OTP for ${mobile}: ${code}`);

    await logAuthEvent({
      eventType: 'otp_request',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      deviceInfo: { mobile }
    });

    return res.json({ message: 'OTP sent successfully to your mobile.' });
  } catch (error) {
    return next(error);
  }
};

const verifyMobileOtp = async (req, res, next) => {
  try {
    const { mobile, code } = req.body;
    const isValid = await verifyOtp(mobile, code);

    if (!isValid) {
      await logAuthEvent({
        eventType: 'otp_verify_fail',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'fail',
        deviceInfo: { mobile, code }
      });
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    let user = await findUserByPhone(mobile);
    if (!user) {
      return res.json({ message: 'OTP verified. Please complete your registration.', mobile, verified: true });
    }

    await logAuthEvent({
      userId: user.id,
      eventType: 'otp_verify_success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    return res.json({
      message: 'Mobile verification successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email.toLowerCase());

    if (user) {
      console.log(`[FINTECH-AUTH] Password reset requested for ${email}. Simulation: Token generated.`);
      await logAuthEvent({
        userId: user.id,
        eventType: 'password_reset_request',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success'
      });
    }

    // Always return success for security (prevent email enumeration)
    return res.json({ message: 'Checking credentials. If match, reset instructions sent.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyMobileOtp,
  forgotPassword
};
