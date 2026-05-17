import { Router } from "express";
import { protect, admin, requireRole } from "../middlewares/authMiddleware";
import {
  getDashboardStats,
  getRecentActivity,
  listUsers,
  getUserById,
  updateUser,
  updateUserBank,
  issueSellerCredentials,
  suspendUser,
  createAdminAccount,
  listAdminAccounts,
  revokeAdminAccount,
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
import {
  adminListReports,
  adminGetReport,
  adminUpdateReport,
  adminReportStats,
} from "../controllers/reportController";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../controllers/categoryController";
import {
  adminListBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
} from "../controllers/heroBannerController";
import {
  adminListAuditLogs,
  adminAuditStats,
} from "../controllers/adminAuditController";
import {
  adminListInvites,
  adminCreateInvite,
  adminRevokeInvite,
  adminResendInvite,
} from "../controllers/adminInviteController";
import {
  adminListSettings,
  adminUpdateSetting,
} from "../controllers/systemSettingController";
import {
  adminListTickets,
  adminGetTicket,
  adminReplyTicket,
  adminUpdateTicketStatus,
  adminTicketStats,
} from "../controllers/supportTicketController";

const router: Router = Router();

// All /api/admin/* routes require an authenticated admin user.
router.use(protect, admin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activity", getRecentActivity);

// Users
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);

// Admin account management — direct create/list/demote (no invite tokens).
// Creating or revoking other admins is the most privileged action in the
// system, so it's gated to super admins only. Anyone with super can elevate
// themselves further; finance/support/content sub-roles cannot.
router.get("/admins", listAdminAccounts);
router.post("/admins", requireRole(["super"]), createAdminAccount);
router.delete("/admins/:id", requireRole(["super"]), revokeAdminAccount);
router.put("/users/:id/bank", requireRole(["super", "finance"]), updateUserBank);
router.post("/users/:id/issue-seller-credentials", issueSellerCredentials);
router.patch("/users/:id/suspend", requireRole(["super", "support"]), suspendUser);

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

// Withdrawals — viewing is open to any admin (for support context), but
// the actual approve/pay/reject decision is finance-only.
router.get("/withdrawals/stats", adminWithdrawStats);
router.get("/withdrawals", adminListWithdrawals);
router.get("/withdrawals/:id", adminGetWithdrawal);
router.patch(
  "/withdrawals/:id/process",
  requireRole(["super", "finance"]),
  adminProcessWithdrawal,
);

// Shops
router.get("/shops/stats", adminShopStats);
router.get("/shops", adminListShops);
router.get("/shops/:id", adminGetShop);

// Notifications
router.get("/notifications/stats", adminNotificationStats);
router.get("/notifications", adminListNotifications);
router.post("/notifications/broadcast", adminBroadcastNotification);

// Audit logs
router.get("/audit/stats", adminAuditStats);
router.get("/audit", adminListAuditLogs);

// Admin invites — only super admins can mint or revoke invite tokens.
router.get("/invites", adminListInvites);
router.post("/invites", requireRole(["super"]), adminCreateInvite);
router.patch("/invites/:id/revoke", requireRole(["super"]), adminRevokeInvite);
router.patch("/invites/:id/resend", requireRole(["super"]), adminResendInvite);

// System settings — global flags, gated to super to prevent a single
// sub-role admin from disabling features platform-wide.
router.get("/settings", adminListSettings);
router.patch("/settings/:key", requireRole(["super"]), adminUpdateSetting);

// Support tickets
router.get("/support/stats", adminTicketStats);
router.get("/support", adminListTickets);
router.get("/support/:id", adminGetTicket);
router.post("/support/:id/reply", adminReplyTicket);
router.patch("/support/:id", adminUpdateTicketStatus);

// Categories
router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.patch("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

router.get("/banners", adminListBanners);
router.post("/banners", adminCreateBanner);
router.patch("/banners/:id", adminUpdateBanner);
router.delete("/banners/:id", adminDeleteBanner);

// Reports
router.get("/reports/stats", adminReportStats);
router.get("/reports", adminListReports);
router.get("/reports/:id", adminGetReport);
router.patch("/reports/:id", adminUpdateReport);

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
