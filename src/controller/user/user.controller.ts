// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service";
import { RequestHandler } from "express";

export class UserController {
  private userService = new UserService();

  /** GET /api/user/profile */
  public getProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("User ID not found");

      const profile = await this.userService.getProfile(userId);
      if (!profile) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };

  /** PUT /api/user/profile */
  public updateProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("User ID not found");

      // Destructure everything you expect from the client
      const {
        name,
        phone,
        bio,
        avatar,
        skills,
        password,
        experience,
        education,
      } = req.body;

      // Build up the payload for your service
      const updateData: any = {
        name,
        phone,
        bio,
        avatar,
        skills,
        password,
      };

      if (experience) updateData.experience = experience;
      if (education) updateData.education = education;

      const updated = await this.userService.updateProfile(userId, updateData);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };
}
