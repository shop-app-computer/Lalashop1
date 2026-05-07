import { apiClient } from "./apiClient";

export interface DashboardStats {
  totals: {
    users: number;
    activeShops: number;
    products: number;
    posts: number;
    revenue: number;
  };
  secondary: {
    pendingOrders: number;
    completedOrders: number;
    activeUsersToday: number;
    pendingShopApprovals: number;
  };
}

export interface RecentActivity {
  id: string;
  text: string;
  type: "shop" | "finance" | "user" | "system";
  at: string;
}

export interface AdminUser {
  _id: string;
  customId?: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isSeller: boolean;
  seller_type?: string;
  balance: number;
  profileImage?: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  twoFactorEnabled: boolean;
  twoFactorType?: "email" | "authenticator" | "none";
  googleId?: string;
  facebookId?: string;
  bank?: AdminBank | null;
  lastKnownIp?: string;
  shopName?: string;
  shopCategory?: string;
  kycStatus?: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "seller" | "buyer" | "admin";
  status?: string;
}

export interface AdminBank {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

export interface AdminUserDetail extends AdminUser {
  hasPassword?: boolean;
  hasPin?: boolean;
  bank?: AdminBank | null;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  balance?: number;
  password?: string;
  pin?: string;
}

export interface UpdateUserBankPayload {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified?: boolean;
}

const buildQuery = (params: Record<string, string | number | undefined>): string => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams();
  entries.forEach(([k, v]) => search.append(k, String(v)));
  return `?${search.toString()}`;
};

export const fetchDashboardStats = () =>
  apiClient<DashboardStats>("/admin/dashboard/stats");

export const fetchRecentActivity = () =>
  apiClient<RecentActivity[]>("/admin/dashboard/activity");

export const fetchUsers = (params: ListUsersParams = {}) =>
  apiClient<AdminUser[]>(`/admin/users${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchUserById = (id: string) =>
  apiClient<AdminUserDetail>(`/admin/users/${id}`);

export const updateUser = (id: string, payload: UpdateUserPayload) =>
  apiClient<AdminUserDetail>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateUserBank = (id: string, payload: UpdateUserBankPayload) =>
  apiClient<AdminBank>(`/admin/users/${id}/bank`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export type KycStatus = "pending" | "approved" | "rejected";

export interface AdminKycSubmission {
  _id: string;
  status: KycStatus;
  businessType: string;
  shopInfo: {
    shopName: string;
    shopAccount: string;
    shopCategory: string;
    shopEmail: string;
    phoneNumber: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    entityName?: string;
  };
  identity: {
    idType: string;
    idNumber: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    birthDate?: string;
    expiryDate?: string;
    tinNumber?: string;
    businessLicenseUrl?: string;
    idDocumentUrl?: string;
    documents?: Array<{
      url: string;
      label?: string;
      mimeType?: string;
      uploadedAt?: string;
    }>;
    address: {
      street: string;
      apartment?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  warehouse: { fullAddress: string };
  user: {
    _id: string;
    name?: string;
    username?: string;
    email: string;
    customId?: string;
    phone?: string;
    profileImage?: string;
  };
  reviewedAt?: string;
  reviewedBy?: { _id: string; name?: string; email?: string } | null;
  reviewNote?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListKycParams {
  status?: KycStatus;
  search?: string;
  user?: string;
}

export const fetchKycSubmissions = (params: ListKycParams = {}) =>
  apiClient<AdminKycSubmission[]>(`/admin/kyc${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchKycSubmission = (id: string) =>
  apiClient<AdminKycSubmission>(`/admin/kyc/${id}`);

export const fetchShopKycByUserId = async (
  userId: string,
): Promise<AdminKycSubmission | null> => {
  const res = await fetchKycSubmissions({ user: userId });
  const list = res.data ?? [];
  if (list.length === 0) return null;
  const approved = list.find((k) => k.status === "approved");
  return approved ?? list[0];
};

export const reviewKycSubmission = (
  id: string,
  payload: { decision: "approved" | "rejected"; note: string },
) =>
  apiClient<AdminKycSubmission>(`/admin/kyc/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// ─── Orders ─────────────────────────────────────────────────────────

export type AdminOrderStatus =
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "pending_payment";

export interface AdminOrderRow {
  _id: string;
  id: string;
  customer: string;
  customerId: string;
  shop: string;
  shopId: string;
  itemCount: number;
  amount: number;
  paymentMethod: string;
  isPaid: boolean;
  isDelivered: boolean;
  rawStatus: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  status: AdminOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product?: { _id: string; name?: string; image?: string };
  seller?: { _id: string; name?: string; email?: string; customId?: string };
  creator?: { _id: string; name?: string; username?: string; customId?: string };
  commission?: number;
}

export interface AdminOrderDetail {
  _id: string;
  user?: { _id: string; name?: string; email?: string; phone?: string; customId?: string } | null;
  orderItems: AdminOrderItem[];
  shippingAddress: { fullName: string; phone: string; address: string };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: AdminOrderStatus;
  rawStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderStats {
  totalOrders: number;
  todayOrders: number;
  cancelled: number;
  refunded: number;
  disputes: number;
  totalRevenue: number;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminOrderStatus | "all";
  startDate?: string;
  endDate?: string;
}

export const fetchAdminOrders = (params: ListOrdersParams = {}) =>
  apiClient<AdminOrderRow[]>(
    `/admin/orders${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchAdminOrder = (id: string) =>
  apiClient<AdminOrderDetail>(`/admin/orders/${id}`);

export const updateAdminOrder = (
  id: string,
  payload: { status?: string; isPaid?: boolean; isDelivered?: boolean },
) =>
  apiClient<AdminOrderDetail>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchAdminOrderStats = () =>
  apiClient<AdminOrderStats>("/admin/orders/stats");

// ─── Products ────────────────────────────────────────────────────────

export interface AdminProductRow {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string | string[];
  images?: string[];
  category: string;
  countInStock: number;
  status: "Active" | "Draft" | "Archived";
  tags?: string[];
  badge?: string;
  rating?: number;
  numReviews?: number;
  soldCount?: number;
  seller?: { _id: string; name?: string; email?: string; customId?: string };
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductStats {
  total: number;
  active: number;
  pending: number;
  banned: number;
  featured: number;
  violations: number;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "pending" | "archived" | "all";
  flag?: "banned" | "featured" | "violations";
  category?: string;
}

export const fetchAdminProducts = (params: ListProductsParams = {}) =>
  apiClient<AdminProductRow[]>(
    `/admin/products${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchAdminProduct = (id: string) =>
  apiClient<AdminProductRow>(`/admin/products/${id}`);

export const updateAdminProduct = (
  id: string,
  payload: {
    status?: "Active" | "Draft" | "Archived";
    action?: "approve" | "ban" | "feature" | "unfeature" | "unban" | "flag-violation" | "clear-violation";
    badge?: string;
  },
) =>
  apiClient<AdminProductRow>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchAdminProductStats = () =>
  apiClient<AdminProductStats>("/admin/products/stats");

// ─── Withdrawals ──────────────────────────────────────────────────────

export type WithdrawStatus = "pending" | "approved" | "completed" | "rejected" | "failed";

export interface AdminWithdrawRow {
  _id: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawStatus;
  reference?: string;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    customId?: string;
    profileImage?: string;
    isSeller?: boolean;
    seller_type?: string;
  };
  bankAccount?: {
    _id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified?: boolean;
  };
}

export interface AdminWithdrawStats {
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  failed: number;
  totalsByStatus: Record<string, number>;
}

export interface ListWithdrawalsParams {
  page?: number;
  limit?: number;
  status?: WithdrawStatus | "all";
  role?: "seller" | "creator" | "all";
  search?: string;
}

export const fetchAdminWithdrawals = (params: ListWithdrawalsParams = {}) =>
  apiClient<AdminWithdrawRow[]>(
    `/admin/withdrawals${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchAdminWithdrawal = (id: string) =>
  apiClient<AdminWithdrawRow>(`/admin/withdrawals/${id}`);

export const processAdminWithdrawal = (
  id: string,
  payload: { decision: "approve" | "reject" | "complete" | "fail"; reference?: string; adminNote?: string },
) =>
  apiClient<AdminWithdrawRow>(`/admin/withdrawals/${id}/process`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchAdminWithdrawStats = () =>
  apiClient<AdminWithdrawStats>("/admin/withdrawals/stats");

// ─── Shops ─────────────────────────────────────────────────────────

export interface AdminShopRow {
  _id: string;
  userId: string;
  customId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerUsername?: string;
  profileImage?: string;
  seller_type?: string;
  balance?: number;
  shopName?: string | null;
  shopCategory?: string | null;
  kycStatus?: KycStatus | null;
  productsCount: number;
  revenue: number;
  ordersCount: number;
  createdAt: string;
}

export interface AdminShopStats {
  total: number;
  active: number;
  pending: number;
  closed: number;
}

export interface ListShopsParams {
  page?: number;
  limit?: number;
  status?: "active" | "pending" | "closed" | "all";
  search?: string;
}

export const fetchAdminShops = (params: ListShopsParams = {}) =>
  apiClient<AdminShopRow[]>(
    `/admin/shops${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchAdminShop = (id: string) =>
  apiClient<AdminShopRow & Record<string, unknown>>(`/admin/shops/${id}`);

export const fetchAdminShopStats = () =>
  apiClient<AdminShopStats>("/admin/shops/stats");

// ─── Notifications ───────────────────────────────────────────────────

export type AdminNotificationType =
  | "kyc_approved"
  | "kyc_rejected"
  | "system"
  | "security"
  | "payout"
  | "info";

export interface AdminNotificationRow {
  _id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  user?: { _id: string; name?: string; email?: string; customId?: string };
  createdAt: string;
}

export interface AdminNotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export interface BroadcastPayload {
  title: string;
  body: string;
  type?: "system" | "security" | "info" | "payout";
  audience?: "all" | "sellers" | "buyers" | "creators";
  link?: string;
}

export const fetchAdminNotifications = (params: { page?: number; limit?: number; type?: string; search?: string } = {}) =>
  apiClient<AdminNotificationRow[]>(
    `/admin/notifications${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const broadcastNotification = (payload: BroadcastPayload) =>
  apiClient<{ sent: number; audience: string }>("/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchAdminNotificationStats = () =>
  apiClient<AdminNotificationStats>("/admin/notifications/stats");

// ─── History tabs ────────────────────────────────────────────────────

export interface HistoryParams {
  user?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const fetchHistoryOrders = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/orders${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryTransactions = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/transactions${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryWithdrawals = (params: HistoryParams = {}) =>
  apiClient<AdminWithdrawRow[]>(`/admin/history/withdrawals${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryBankChanges = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/bank-changes${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryKyc = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/kyc${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryLoginDevice = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/login-device${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryLinkedAccounts = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/linked-accounts${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryEditLogs = (params: HistoryParams = {}) =>
  apiClient<unknown[]>(`/admin/history/edit-logs${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryDepositSources = (params: HistoryParams = {}) =>
  apiClient<{ _id: string; count: number; total: number }[]>(`/admin/history/deposit-sources${buildQuery(params as Record<string, string | number | undefined>)}`);

export const fetchHistoryRiskSignals = () =>
  apiClient<unknown[]>(`/admin/history/risk-signals`);

export const fetchHistoryFinancial = (params: HistoryParams = {}) =>
  apiClient<{ revenue: number; ordersPaid: number; withdrawals: Record<string, { total: number; count: number }> }>(
    `/admin/history/financial${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchHistorySupport = () =>
  apiClient<unknown[]>(`/admin/history/support`);

export const fetchHistoryAdminAudit = () =>
  apiClient<unknown[]>(`/admin/history/admin-audit`);

// ─── Reports ──────────────────────────────────────────────────────────

export type ReportTargetType = "user" | "shop" | "product" | "post" | "comment";
export type ReportReason = "spam" | "abuse" | "fraud" | "counterfeit" | "harassment" | "other";
export type ReportStatus = "open" | "reviewing" | "actioned" | "dismissed";
export type ReportAction = "none" | "warn" | "remove" | "suspend" | "ban";

export interface AdminReportRow {
  _id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  evidence?: string[];
  status: ReportStatus;
  actionTaken: ReportAction;
  adminNote?: string;
  reviewedAt?: string;
  reportedBy?: { _id: string; name?: string; email?: string; customId?: string; profileImage?: string };
  assignedTo?: { _id: string; name?: string; email?: string; customId?: string } | null;
  reviewedBy?: { _id: string; name?: string; email?: string; customId?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReportStats {
  total: number;
  open: number;
  reviewing: number;
  actioned: number;
  dismissed: number;
  byReason: Record<string, number>;
  byTargetType: Record<string, number>;
}

export interface ListReportsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReportStatus | "all";
  reason?: ReportReason | "all";
  targetType?: ReportTargetType | "all";
  targetId?: string;
}

export const fetchAdminReports = (params: ListReportsParams = {}) =>
  apiClient<AdminReportRow[]>(
    `/admin/reports${buildQuery(params as Record<string, string | number | undefined>)}`,
  );

export const fetchAdminReport = (id: string) =>
  apiClient<AdminReportRow>(`/admin/reports/${id}`);

export const updateAdminReport = (
  id: string,
  payload: {
    status?: ReportStatus;
    actionTaken?: ReportAction;
    adminNote?: string;
    assignedTo?: string | null;
  },
) =>
  apiClient<AdminReportRow>(`/admin/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchAdminReportStats = () =>
  apiClient<AdminReportStats>("/admin/reports/stats");

