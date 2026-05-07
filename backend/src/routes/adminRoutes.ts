import { Router } from "express";
// import { protect, admin } from "../middlewares/authMiddleware";
import {
  getDashboardStats,
  getRecentActivity,
  listUsers,
  getUserById,
  updateUser,
  updateUserBank,
} from "../controllers/adminController";
import {
  adminListKyc,
  adminGetKyc,
  adminReviewKyc,
} from "../controllers/kycController";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrder,
  adminOrderStats,
} from "../controllers/adminOrdersController";
import {
  adminListProducts,
  adminGetProduct,
  adminUpdateProduct,
  adminProductStats,
} from "../controllers/adminProductsController";
import {
  adminListWithdrawals,
  adminGetWithdrawal,
  adminProcessWithdrawal,
  adminWithdrawStats,
} from "../controllers/adminWithdrawController";
import {
  adminListShops,
  adminGetShop,
  adminShopStats,
} from "../controllers/adminShopsController";
import {
  adminListNotifications,
  adminBroadcastNotification,
  adminNotificationStats,
} from "../controllers/adminNotificationsController";
import {
  historyOrders,
  historyTransactions,
  historyWithdrawals,
  historyBankChanges,
  historyKyc,
  historyLoginDevice,
  historyLinkedAccounts,
  historyEditLogs,
  historyDepositSources,
  historyRiskSignals,
  historyFinancial,
  historySupport,
  historyAdminAudit,
} from "../controllers/adminHistoryController";

const router: Router = Router();

// TODO(auth): re-enable before going live.
// router.use(protect, admin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activity", getRecentActivity);

// Users
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.put("/users/:id/bank", updateUserBank);

// KYC
router.get("/kyc", adminListKyc);
router.get("/kyc/:id", adminGetKyc);
router.patch("/kyc/:id/review", adminReviewKyc);

// Orders
router.get("/orders/stats", adminOrderStats);
router.get("/orders", adminListOrders);
router.get("/orders/:id", adminGetOrder);
router.patch("/orders/:id", adminUpdateOrder);

// Products
router.get("/products/stats", adminProductStats);
router.get("/products", adminListProducts);
router.get("/products/:id", adminGetProduct);
router.patch("/products/:id", adminUpdateProduct);

// Withdrawals
router.get("/withdrawals/stats", adminWithdrawStats);
router.get("/withdrawals", adminListWithdrawals);
router.get("/withdrawals/:id", adminGetWithdrawal);
router.patch("/withdrawals/:id/process", adminProcessWithdrawal);

// Shops
router.get("/shops/stats", adminShopStats);
router.get("/shops", adminListShops);
router.get("/shops/:id", adminGetShop);

// Notifications
router.get("/notifications/stats", adminNotificationStats);
router.get("/notifications", adminListNotifications);
router.post("/notifications/broadcast", adminBroadcastNotification);

// History tabs
router.get("/history/orders", historyOrders);
router.get("/history/transactions", historyTransactions);
router.get("/history/withdrawals", historyWithdrawals);
router.get("/history/bank-changes", historyBankChanges);
router.get("/history/kyc", historyKyc);
router.get("/history/login-device", historyLoginDevice);
router.get("/history/linked-accounts", historyLinkedAccounts);
router.get("/history/edit-logs", historyEditLogs);
router.get("/history/deposit-sources", historyDepositSources);
router.get("/history/risk-signals", historyRiskSignals);
router.get("/history/financial", historyFinancial);
router.get("/history/support", historySupport);
router.get("/history/admin-audit", historyAdminAudit);

export default router;
