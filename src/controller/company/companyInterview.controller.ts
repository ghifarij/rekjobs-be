// src/controllers/company.controller.ts
import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";
import { CompanyInterviewService } from "../../services/companyInterview.service";

export class CompanyInterviewController {
  private companyInterviewService: CompanyInterviewService;

  public createInterview: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { applicationId, scheduledAt, notes } = req.body;
      const interview = await this.companyInterviewService.createInterview(
        Number(applicationId),
        new Date(scheduledAt),
        notes
      );
      res.status(201).json(interview);
    } catch (err) {
      next(err);
    }
  };

  public getCompanyInterviews: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        res.sendStatus(401);
        return;
      }
      const interviews =
        await this.companyInterviewService.getCompanyInterviews(companyId);
      res.status(200).json(interviews);
    } catch (err) {
      next(err);
    }
  };

  // POST /api/interviews/company/:id/reschedule
  public reschedule: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company!.id;
      const interviewId = Number(req.params.id);
      const { scheduledAt, notes } = req.body;
      const updated = await this.companyInterviewService.rescheduleInterview(
        interviewId,
        companyId,
        new Date(scheduledAt),
        notes
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  constructor() {
    this.companyInterviewService = new CompanyInterviewService();
  }
}
