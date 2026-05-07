import { Response } from "express";
import ShopSetting from "../models/shopSettingModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const requireUser = (req: IAuthRequest, res: Response): string | null => {
  const id = req.user?._id?.toString();
  if (!id) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return id;
};

// Lazy-create the settings document the first time a seller hits the API.
const getOrCreate = async (shopId: string) => {
  let doc = await ShopSetting.findOne({ shop: shopId });
  if (!doc) doc = await ShopSetting.create({ shop: shopId });
  return doc;
};

// GET /api/shop-settings — full document for the current seller
export const getSettings = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const doc = await getOrCreate(shopId);
    res.json({ success: true, data: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// PUT /api/shop-settings/general
export const updateGeneral = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const doc = await getOrCreate(shopId);
    Object.assign(doc.general, req.body || {});
    await doc.save();
    res.json({ success: true, data: doc.general });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

// PUT /api/shop-settings/shipping
export const updateShipping = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const doc = await getOrCreate(shopId);
    const body = req.body || {};
    if (Array.isArray(body.zones)) doc.shipping.zones = body.zones;
    delete body.zones;
    Object.assign(doc.shipping, body);
    await doc.save();
    res.json({ success: true, data: doc.shipping });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

// PUT /api/shop-settings/payment
export const updatePayment = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const doc = await getOrCreate(shopId);
    Object.assign(doc.payment, req.body || {});
    await doc.save();
    res.json({ success: true, data: doc.payment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

// POST /api/shop-settings/integrations/:key/toggle
// Body: { enabled: boolean, account?: string }
export const toggleIntegration = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const allowed = ["tiktok", "facebook", "instagram", "line", "shopify"];
    const key = String(req.params.key);
    if (!allowed.includes(key)) {
      res.status(400).json({ success: false, message: "Invalid integration key" });
      return;
    }
    const enabled = !!req.body?.enabled;
    const account = req.body?.account ? String(req.body.account) : undefined;

    const doc = await getOrCreate(shopId);
    const existing = doc.integrations.find((i) => i.key === key);
    if (existing) {
      existing.enabled = enabled;
      existing.connectedAt = enabled ? new Date() : undefined;
      if (account !== undefined) existing.account = account;
    } else {
      doc.integrations.push({
        key: key as "tiktok" | "facebook" | "instagram" | "line" | "shopify",
        enabled,
        connectedAt: enabled ? new Date() : undefined,
        account: account || "",
      });
    }
    await doc.save();
    res.json({ success: true, data: doc.integrations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};
