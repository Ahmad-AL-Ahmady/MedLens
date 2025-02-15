const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const crypto = require("crypto");

// console.log("Setting up Google Strategy with following config:");
// console.log("Client ID exists:", !!process.env.GOOGLE_CLIENT_ID);
// console.log("Client Secret exists:", !!process.env.GOOGLE_CLIENT_SECRET);
// console.log(
//   "Callback URL:",
//   "http://localhost:4000/api/users/auth/google/callback"
// );

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/users/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Received Google profile:", {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          displayName: profile.displayName,
        });

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value },
          ],
        });

        if (user) {
          console.log("Existing user found:", user._id);
          if (!user.googleId) {
            console.log("Updating existing user with Google ID");
            user.googleId = profile.id;
            user.provider = "google";
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }

        console.log("Creating new user from Google profile");
        const randomPassword = crypto.randomBytes(20).toString("hex");

        const names = profile.displayName.split(" ");
        const firstName = names[0];
        const lastName = names[names.length - 1] || "";

        user = await User.create({
          googleId: profile.id,
          firstName,
          lastName,
          email: profile.emails[0].value,
          password: randomPassword,
          provider: "google",
          userType: "Patient",
          profileCompleted: false,
        });

        console.log("New user created:", user._id);
        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialization
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Deserialization error:", err);
    done(err, null);
  }
});

module.exports = passport;
