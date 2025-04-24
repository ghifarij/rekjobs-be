import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserPayload } from "../types/express";

export const verifyTokenUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "No authorization header found" });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    try {
      // verify returns the payload object
      const verifiedUser = verify(token, process.env.JWT_KEY!) as UserPayload;
      // attach to req.user
      req.user = verifiedUser;
      next();
    } catch (verifyError) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  } catch (err) {
    console.error("Token verification error:", err);
    res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};
