import passport from "passport";
import passportGoogle from "passport-google-oauth20";
const GoogleStrategy = passportGoogle.Strategy;

import { User } from "../models/user";
import SerializedUser from "../types/serializedUser";
import config from "./keys";
import { generateTokens } from "../utils/generateToken";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleOAuth.clientId || "",
      clientSecret: config.googleOAuth.clientSecret || "",
      callbackURL: "http://localhost:8000/api/v1/user/google/auth/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails ? profile.emails[0].value : null,
          });
        }
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();
        const serializedUser: SerializedUser = {
          id: user._id.toString(),
          profile: profile,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        return cb(null, serializedUser);
      } catch (err) {
        console.log("error while logging in with Google: ", err);
        return cb(err, false);
      }
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: any, done) => {
  try {
    const dbUser = await User.findById(user.id);
    done(null, dbUser);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
