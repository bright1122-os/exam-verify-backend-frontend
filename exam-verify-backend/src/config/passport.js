import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import logger from '../utils/logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        const existingEmail = await User.findOne({
          email: profile.emails[0].value
        });

        if (existingEmail) {
          existingEmail.googleId = profile.id;
          existingEmail.lastLogin = new Date();
          await existingEmail.save();
          return done(null, existingEmail);
        }

        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          role: 'student',
        });

        logger.info(`New user registered: ${user.email}`);
        done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
