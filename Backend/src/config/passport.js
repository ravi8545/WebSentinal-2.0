const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.warn('[passport] Google OAuth env vars missing — strategy not registered');
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          const name =
            profile.displayName ||
            (profile.name?.givenName && profile.name?.familyName
              ? profile.name.givenName + ' ' + profile.name.familyName
              : null) ||
            'WebSentinal User';

          if (!email) {
            return done(new Error('Google account has no email'), null);
          }

          if (!name) {
            console.error('Name is missing from Google profile:', profile);
          }

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: name,
              email: email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              provider: 'google',
              emailIntegration: {
                connected: true,
                email: email.toLowerCase(),
                connectedAt: new Date(),
              },
            });
          } else {
            let dirty = false;
            if (!user.name) {
              user.name = name;
              dirty = true;
            }
            if (!user.googleId) {
              user.googleId = profile.id;
              dirty = true;
            }
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
              dirty = true;
            }
            if (!user.password && user.provider !== 'google') {
              user.provider = 'google';
              dirty = true;
            }
            if (dirty) await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );

  return passport;
}

module.exports = configurePassport;
