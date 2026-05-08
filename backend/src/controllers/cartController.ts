import { Request, Response } from "express";
import Cart from "../models/cartModel";
import Product from "../models/productModel";

// Helper to calculate cart totals
const calculateCart = (cart: any) => {
  cart.subtotal = cart.items.reduce((acc: number, item: any) => {
    const total = Number(item.total) || 0;
    return acc + total;
  }, 0);
  return cart;
};

// Helper to get sessionId or user ID
const getCartIdentifier = (req: any) => {
  // If user is logged in, use their ID
  if (req.user && req.user._id) {
    return { user: req.user._id };
  }
  // Otherwise use a session/guest ID
  return { sessionId: "guest-session" };
};

// @desc    Get current cart
// @route   GET /api/cart
// @access  Public
export const getCart = async (req: Request, res: Response) => {
  try {
    const identifier = getCartIdentifier(req);
    
    // Use findOneAndUpdate with upsert to avoid race conditions
    let cart = await Cart.findOneAndUpdate(
      identifier,
      { $setOnInsert: { items: [], subtotal: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate({
      path: "items.productId",
      select: "name image supplierName description price seller"
    });

    // Map to the structure expected by frontend. Surface every field the
    // checkout pages need: `seller` (otherwise order POSTs fail validation)
    // and `variants` (so the order line item can echo the buyer's choice).
    const formattedItems = cart ? cart.items.map((item: any) => {
      if (!item.productId) return null;
      return {
        productId: item.productId._id,
        qty: item.qty,
        unitPrice: item.unitPrice,
        total: item.total,
        seller: item.seller,
        variants: item.variants || {},
        product: {
          id: item.productId._id,
          name: item.productId.name,
          image: Array.isArray(item.productId.image) ? item.productId.image[0] : item.productId.image,
          description: item.productId.description
        }
      };
    }).filter(Boolean) : [];

    res.status(200).json({
      success: true,
      cart: {
        items: formattedItems,
        subtotal: cart ? cart.subtotal : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart/items
// @access  Public
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, qty, unitPrice, variants } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Buyers picking different variant combos of the same product should get
    // separate line items (e.g. Size:S vs Size:L). We key the merge by both
    // productId and a stable hash of the variants map.
    const variantKey = variants && typeof variants === "object"
      ? Object.keys(variants)
          .sort()
          .map((k) => `${k}=${(variants as Record<string, string>)[k]}`)
          .join("|")
      : "";

    const identifier = getCartIdentifier(req);
    
    // Atomic find and create if not exists
    let cart = await Cart.findOneAndUpdate(
      identifier,
      { $setOnInsert: { items: [], subtotal: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!cart) throw new Error("Could not create/find cart");

    const itemVariantKey = (item: { variants?: Record<string, string> }): string => {
      const v = item.variants || {};
      return Object.keys(v).sort().map((k) => `${k}=${v[k]}`).join("|");
    };

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        itemVariantKey(item) === variantKey
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const item = cart.items[existingItemIndex];
      const val = Number(qty);
      
      if (unitPrice !== undefined) {
        // From Product Page: Add to existing quantity
        item.qty += (isNaN(val) ? 1 : val);
      } else {
        // From Cart Page: Set to absolute quantity
        item.qty = (isNaN(val) ? 1 : val);
      }
      
      // Update price if provided, otherwise keep existing
      if (unitPrice !== undefined) {
        item.unitPrice = Number(unitPrice) || item.unitPrice;
      }
      
      item.total = item.qty * item.unitPrice;
    } else {
      // New item
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      
      const price = Number(unitPrice) || Number(product.price) || 0;
      const quantity = Number(qty) || 1;

      cart.items.push({
        productId,
        seller: product.seller || "000000000000000000000000",
        qty: quantity,
        unitPrice: price,
        total: quantity * price,
        variants: variants && typeof variants === "object" ? variants : {},
      });
    }

    calculateCart(cart);
    
    // Explicitly mark items as modified to ensure Mongoose saves the array changes
    cart.markModified('items');
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error: any) {
    console.error("Add To Cart Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.name === "CastError" ? "Invalid Product ID" : error.message 
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items
// @access  Public
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const identifier = getCartIdentifier(req);

    let cart = await Cart.findOne(identifier);

    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
      calculateCart(cart);
      await cart.save();
      res.status(200).json({ success: true, cart });
    } else {
      res.status(404).json({ success: false, message: "Cart not found" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart
// @access  Public
export const clearCart = async (req: Request, res: Response) => {
  try {
    const sessionId = "guest-session";
    let cart = await Cart.findOne({ sessionId });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
