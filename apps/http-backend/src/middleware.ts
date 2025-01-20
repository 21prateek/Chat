import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  const decoded = jwt.verify(token as string, JWT_SECRET);

  if (decoded) {
    if (typeof decoded == "string") {
      res.status(403).json({
        message: "You are not logged in",
      });
    }
    req.userId = (decoded as JwtPayload).userId;
    next();
  } else {
    res.json({
      message: "Invalid token",
    });
  }
}
