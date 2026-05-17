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
import rateLimit from "express-rate-limit";

const router: Router = Router();

// Brute-force guard for credential endpoints. Per-IP, 10 attempts / 15 min.
// We don't want this on /me, /verify-reset-code, etc. — only on the routes
// that take a password or claim a reset code.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please wait a few minutes and try again.",
  },
});

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
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET as string);
    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${base}/login?token=${token}`);
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
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${base}/login-success?token=${token}`);
  },
);


// Auth Routes
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/seller-login", authRateLimiter, sellerLogin);
router.get("/me", protect as any, getMe);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/verify-reset-code", authRateLimiter, verifyResetCode);
router.post("/reset-password", authRateLimiter, resetPassword);

// Withdrawal PIN Route — rate-limited because setting/changing the PIN is a
// security-sensitive action that an XSS-stolen token could abuse.
router.post("/withdraw-pin/set", authRateLimiter, protect as any, setWithdrawPin);

// 2FA Routes — rate-limited so an attacker can't bomb the user with email
// OTPs or brute-force the 6-digit code (10 tries / 15 min would take ~285
// years to enumerate 10^6 codes).
router.post("/2fa/email/send", authRateLimiter, protect as any, sendEmailOTP);
router.post("/2fa/email/verify", authRateLimiter, protect as any, verifyEmailOTP);
router.get("/2fa/setup", protect as any, setupTOTP);
router.post("/2fa/verify", authRateLimiter, protect as any, verifyTOTP);

export default router;
