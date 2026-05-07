import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export interface IAuthRequest extends Request {
  user?: any;
}

export const protect = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            
            // ป้องกันกรณี token เป็น string "null" หรือ "undefined"
            if (!token || token === "null" || token === "undefined") {
              return res.status(401).json({ success: false, message: "Not authorized, invalid token format" });
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
            
            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User no longer exists" });
            }
            
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const optionalProtect = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (token && token !== "null" && token !== "undefined") {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        req.user = await User.findById(decoded.id).select("-password");
      }
    } catch (error) {
      // Don't fail, just don't set req.user
    }
  }
  next();
};

export const admin = (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Not authorized as an admin" });
    }
};
