const express = require('express');
const { body } = require('express-validator');
const { register, login, sendOtp, verifyMobileOtp, forgotPassword } = require('../controllers/authController');
const router = express.Router();

// Validation Middleware
const signupValidation = [
  body('name').notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('phone').notEmpty().withMessage('Mobile number is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain a number, uppercase letter, and special character.')
];

// Routes
router.post('/signup', signupValidation, register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyMobileOtp);
router.post('/forgot-password', forgotPassword);

module.exports = router;
