import { Request, Response } from "express";
import CreatorProduct from "../models/creatorProductModel";
import AffiliateClick from "../models/affiliateClickModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const FRONTEND_BASE = process.env.FRONTEND_URL || "http://localhost:3000";

// GET /r/:code  (mounted at root in app.ts)
// Records the click, sets a tracking cookie, redirects to product page.
export const trackAndRedirect = async (req: IAuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const row = await CreatorProduct.findOne({ affiliateCode: code }).populate(
      "product",
      "_id cookieDays"
    );

    if (!row || !row.product) {
      return res.redirect(FRONTEND_BASE);
    }

    const productId = (row.product as any)._id.toString();
    const cookieDays = (row.product as any).cookieDays || 30;
    const expiresAt = new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000);

    await AffiliateClick.create({
      creator: row.creator,
      product: row.product,
      affiliateCode: code,
      visitor: req.user?._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      referrer: (req.headers.referer || req.headers.referrer || "") as string,
      expiresAt,
    });

    await CreatorProduct.updateOne({ _id: row._id }, { $inc: { clicks: 1 } });

    // Cookie: stores affiliate code per visitor for attribution at checkout time.
    res.cookie(`aff_${productId}`, code, {
      maxAge: cookieDays * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
    });

    return res.redirect(`${FRONTEND_BASE}/products/${productId}?ref=${code}`);
  } catch (error: any) {
    return res.redirect(FRONTEND_BASE);
  }
};

// POST /api/affiliate/attribute
// Body: { productId, affiliateCode? } — optional client-side hint when cookies not available.
// Returns a server-confirmed attribution payload that the order should embed.
export const attributeProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const { productId, affiliateCode } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    let code = affiliateCode || req.cookies?.[`aff_${productId}`];
    if (!code) {
      return res.status(200).json({ success: true, data: null });
    }

    const row = await CreatorProduct.findOne({ affiliateCode: code }).populate(
      "product",
      "_id commissionType commissionValue"
    );
    if (!row || (row.product as any)._id.toString() !== productId.toString()) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({
      success: true,
      data: {
        creator: row.creator,
        affiliateCode: code,
        commissionType: (row.product as any).commissionType,
        commissionValue: (row.product as any).commissionValue,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
