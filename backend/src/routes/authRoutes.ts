import { Router } from "express";
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/callback", 
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || "secret");
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

// --- FACEBOOK AUTH ---
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
  "/facebook/callback",
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
