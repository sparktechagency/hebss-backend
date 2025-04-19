import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcrypt';
import User from '../app/modules/userModule/user.model';
import config from './index';

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'User not found' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          user = await User.create({
            email: profile.emails?.[0].value,
            name: profile.displayName,
            googleId: profile.id,
            provider: 'google',
            password: await bcrypt.hash(Math.random().toString(36), 10),
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook_client_id,
      clientSecret: config.facebook_client_secret,
      callbackURL: config.facebook_redirect_url,
      profileFields: ['id', 'emails', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          user = await User.create({
            email: profile.emails?.[0].value,
            name: `${profile.name?.givenName} ${profile.name?.familyName}`,
            facebookId: profile.id,
            provider: 'facebook',
            password: await bcrypt.hash(Math.random().toString(36), 10),
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
