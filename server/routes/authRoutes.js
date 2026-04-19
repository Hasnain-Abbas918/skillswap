const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');
const {
  pickStateForGoogleStart,
  pickClientBaseFromCallback,
  getDefaultFailureRedirect,
} = require('../utils/oauthClientUrl');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/google', (req, res, next) => {
  const state = pickStateForGoogleStart(req);
  if (!state) {
    return res.status(500).json({ message: 'Set CLIENT_URL or ALLOWED_CLIENT_ORIGINS in server environment.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(getDefaultFailureRedirect(req));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user.id);
    const clientBase = pickClientBaseFromCallback(req);
    const target = `${clientBase}/auth/google/success?token=${token}&name=${encodeURIComponent(req.user.name)}`;
    res.redirect(target);
  }
);

module.exports = router;
