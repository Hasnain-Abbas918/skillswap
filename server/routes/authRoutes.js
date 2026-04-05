const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ NEW: Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`, session: false }),
  (req, res) => {
    const token = generateToken(req.user.id);
    // Token URL mein pass karo → client localStorage mein save karega
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&avatar=${encodeURIComponent(req.user.avatar || '')}&role=${req.user.role}`);
  }
);

module.exports = router;