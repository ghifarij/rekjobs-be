// src/controllers/apply/application.controller.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { CompanyApplicationService } from "../../services/companyApplication.service";
import { ApplicationStatus } from "prisma/generated/client";

export class CompanyApplicationController {
  private companyApplicationService = new CompanyApplicationService();

  /** GET /api/applications/company */
  public getCompanyApplications: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const applications =
        await this.companyApplicationService.getCompanyApplications(companyId);
      res.status(200).json({ applications });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/applications/company/:id */
  public getApplicationById: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const applicationId = parseInt(req.params.id, 10);
      const details = await this.companyApplicationService.getApplicationById(
        companyId,
        applicationId
      );

      res.status(200).json({ details });
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/applications/company/:id/status */
  public updateApplicationStatus: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const applicationId = parseInt(req.params.id, 10);
      const { status } = req.body as { status: string };

      // Enforce allowed statuses at service level or here if you prefer
      const updated =
        await this.companyApplicationService.updateApplicationStatus(
          companyId,
          applicationId,
          status as ApplicationStatus
        );

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };
}
