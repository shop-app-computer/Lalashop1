import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  register,
  login,
  sellerLogin,
  getMe,
  setWithdrawPin,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController";
import {
  sendEmailOTP,
  verifyEmailOTP,
  setupTOTP,
  verifyTOTP,
} from "../controllers/twoFactorController";
import { protect } from "../middlewares/authMiddleware";
import passport from "passport";

const router: Router = Router();

// Returns a friendly error if the requested OAuth provider hasn't been
// configured (env vars missing). Without this guard, Passport throws
// "Unknown authentication strategy 'google'" and the response is
// confusing for end users.
const requireOAuth = (provider: "google" | "facebook") =>
  (req: Request, res: Response, next: NextFunction) => {
    const ok =
      provider === "google"
        ? Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        : Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
    if (!ok) {
      return res.status(503).json({
        success: false,
        provider,
        message:
          `${provider} login is not configured on this server. ` +
          `Set the ${provider === "google" ? "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET" : "FACEBOOK_APP_ID/FACEBOOK_APP_SECRET"} env vars and restart.`,
      });
    }
    next();
  };

// --- GOOGLE AUTH ---
router.get(
  "/google",
  requireOAuth("google"),
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  requireOAuth("google"),
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || "secret");
    res.redirect(`http://localhost:3000/login?token=${token}`);
  },
);

// --- FACEBOOK AUTH ---
router.get(
  "/facebook",
  requireOAuth("facebook"),
  passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
  "/facebook/callback",
  requireOAuth("facebook"),
  passport.authenticate("facebook", { session: false }),
  (req: any, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );
    res.redirect(`http://localhost:3000/login-success?token=${token}`);
  },
);


// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/seller-login", sellerLogin);
router.get("/me", protect as any, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// Withdrawal PIN Route
router.post("/withdraw-pin/set", protect as any, setWithdrawPin);

// 2FA Routes
router.post("/2fa/email/send", protect as any, sendEmailOTP);
router.post("/2fa/email/verify", protect as any, verifyEmailOTP);
router.get("/2fa/setup", protect as any, setupTOTP);
router.post("/2fa/verify", protect as any, verifyTOTP);

export default router;
