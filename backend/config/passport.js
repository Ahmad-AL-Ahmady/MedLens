const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if not found
          user = await User.create({
            googleId: profile.id,
            provider: "google",
            email: profile.emails[0].value,
            username: profile.displayName,
            // Add default values for required fields
            userType: "user",
            location: { type: "Point", coordinates: [0, 0] },
            gender: "male",
            age: 18,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialization/Deserialization (required for sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
