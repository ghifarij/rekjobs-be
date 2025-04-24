// src/controllers/userApplication.controller.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserApplicationService } from "../../services/userApplication.service";

export class UserApplicationController {
  private applicationService = new UserApplicationService();

  /** POST /api/applications */
  public createApplication: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const applicantId = req.user?.id;
      if (!applicantId) throw new Error("User ID not found");

      const jobId = Number(req.body.jobId);
      if (!jobId) throw new Error("Job ID is required");

      // Multer puts files on req.files as an object of arrays
      const files = req.files as
        | {
            [field: string]: Express.Multer.File[];
          }
        | undefined;

      const coverLetterFile = files?.coverLetter?.[0];
      const resumeFile = files?.resume?.[0];

      const application = await this.applicationService.createApplication(
        applicantId,
        jobId,
        { coverLetterFile, resumeFile }
      );

      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/applications */
  public getUserApplications: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("User ID not found");

      const applications = await this.applicationService.getUserApplications(
        userId
      );
      res.json(applications);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/applications/:id */
  public deleteApplication: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("User ID not found");

      const applicationId = parseInt(req.params.id, 10);
      await this.applicationService.deleteApplication(applicationId, userId);

      res.json({ message: "Application deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
}
