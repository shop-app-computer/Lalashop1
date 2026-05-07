import { Request, Response, NextFunction } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
    }
  }
}

export const cookieParser = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (header) {
    for (const part of header.split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq).trim();
      const val = part.slice(eq + 1).trim();
      if (key) out[key] = decodeURIComponent(val);
    }
  }
  req.cookies = out;
  next();
};
