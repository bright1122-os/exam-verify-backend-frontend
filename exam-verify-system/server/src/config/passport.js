import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

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
        // Try to find existing user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Try to find existing user by email and link Google account
        const email = profile.emails?.[0]?.value;
        if (email) {
          const existingEmail = await User.findOne({ email });
          if (existingEmail) {
            existingEmail.googleId = profile.id;
            existingEmail.avatar = existingEmail.avatar || profile.photos?.[0]?.value;
            existingEmail.lastLogin = new Date();
            await existingEmail.save();
            return done(null, existingEmail);
          }
        }

        // Create new user from Google profile
        user = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          role: 'student',
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
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
