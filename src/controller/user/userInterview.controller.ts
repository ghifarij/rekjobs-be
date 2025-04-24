// src/controllers/company.controller.ts
import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";
import { UserInterviewService } from "../../services/userInterview.service";

export class UserInterviewController {
  private userInterviewService: UserInterviewService;
  // POST /api/interviews/user/:id/reschedule
  public requestReschedule: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const applicantId = req.user!.id;
      const interviewId = Number(req.params.id);
      const updated =
        await this.userInterviewService.requestRescheduleInterview(
          interviewId,
          applicantId
        );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public acceptInterview: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updated = await this.userInterviewService.acceptInterview(
        parseInt(req.params.id),
        req.user!.id
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  constructor() {
    this.userInterviewService = new UserInterviewService();
  }
}
