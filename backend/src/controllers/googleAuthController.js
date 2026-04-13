const axios = require('axios');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const getGoogleConfig = () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
});

const googleAuthStart = (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = getGoogleConfig();

  if (!GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID not set. Available env keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('CLIENT')));
    return res.status(500).json({ success: false, message: 'Google OAuth not configured' });
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GOOGLE_CALLBACK_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  res.redirect(authUrl.toString());
};

const googleAuthCallback = async (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, FRONTEND_URL } = getGoogleConfig();

  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/oauth/callback?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id: googleId, email, name: fullName, picture: avatar } = userResponse.data;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/oauth/callback?error=no_email`);
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        fullName: fullName || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        avatar: avatar || '',
        isVerified: true
      });
    }

    if (user.isSuspended) {
      return res.redirect(`${FRONTEND_URL}/oauth/callback?error=suspended`);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.isSuperAdmin ? 'admin' : 'member', user.isSuperAdmin);
    const refreshToken = generateRefreshToken(user._id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    user.refreshTokenHash = refreshTokenHash;
    user.lastLoginAt = new Date();
    await user.save();

    // Build user object for frontend
    const userObj = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isSuperAdmin: user.isSuperAdmin,
      authProvider: user.authProvider,
      notificationPrefs: user.notificationPrefs
    };

    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      user: JSON.stringify(userObj)
    });

    res.redirect(`${FRONTEND_URL}/oauth/callback?${params.toString()}`);

  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.redirect(`${FRONTEND_URL}/oauth/callback?error=auth_failed`);
  }
};

module.exports = {
  googleAuthStart,
  googleAuthCallback
};
