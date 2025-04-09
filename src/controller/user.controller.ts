import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../prisma";

export class UserController {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          bio: true,
          avatar: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, phone, bio, skills } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, phone, bio, skills },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          bio: true,
          avatar: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  public updateAvatar: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { avatar } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  async updateResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { resume } = req.body;

      // Since resume is not in the User model but in Application,
      // we'll need to update the latest application's resume
      const latestApplication = await prisma.application.findFirst({
        where: { applicantId: req.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!latestApplication) {
        res.status(404).json({
          success: false,
          message: "No application found",
        });
        return;
      }

      const updatedApplication = await prisma.application.update({
        where: { id: latestApplication.id },
        data: { resume },
      });

      res.status(200).json({
        success: true,
        data: updatedApplication,
      });
    } catch (error) {
      next(error);
    }
  }
}
