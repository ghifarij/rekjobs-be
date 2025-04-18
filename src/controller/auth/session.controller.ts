// src/controllers/session.controller.ts
import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import prisma from "../../prisma";

// New explicit payload type
type ExplicitSessionPayload = {
  id: number;
  type: "user" | "company";
};

export class SessionController {
  public async getSession(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const payload = verify(
        token,
        process.env.JWT_KEY!
      ) as ExplicitSessionPayload;

      // Ensure both id and type exist
      if (!payload || !payload.id || !payload.type) {
        res
          .status(401)
          .json({ message: "Unauthorized: Invalid token payload" });
        return;
      }

      // Use payload.id and payload.type to fetch the appropriate record
      if (payload.type === "user") {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        res.status(200).json({
          type: "user",
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          googleId: user.googleId,
        });
      } else if (payload.type === "company") {
        const company = await prisma.company.findUnique({
          where: { id: payload.id },
        });
        if (!company) {
          res.status(404).json({ message: "Company not found" });
          return;
        }

        res.status(200).json({
          type: "company",
          id: company.id,
          name: company.name,
          email: company.email,
          logo: company.logo,
          isVerified: company.isVerified,
          googleId: company.googleId,
        });
      } else {
        res.status(403).json({ message: "Forbidden: Unknown session type" });
      }
    } catch (err) {
      console.error("Session error:", err);
      res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
  }
}
