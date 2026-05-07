import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import UserModel from "../models/userModel"; // อ้างอิงตามไฟล์ userModel.ts ในรูปคุณ

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await UserModel.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }],
          });

          if (!user) {
            user = await UserModel.create({
              username: profile.displayName,
              email: profile.emails?.[0].value,
              googleId: profile.id,
              profileImage: profile.photos?.[0].value,
              isVerified: true,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      },
    ),
  );
} else {
  console.warn(
    "[passport] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.",
  );
}


