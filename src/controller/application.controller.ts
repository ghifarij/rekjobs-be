import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApplicationStatusLocal } from "../types";

export class ApplicationController {
  public getCompanyApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applications = await prisma.application.findMany({
        where: {
          job: {
            companyId: req.user.companyId,
          },
        },
        include: {
          job: true,
          applicant: true,
        },
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  };

  public getUserApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applications = await prisma.application.findMany({
        where: {
          applicantId: req.user.id,
        },
        include: {
          job: true,
        },
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  };

  public getApplicationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const application = await prisma.application.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
        include: {
          job: true,
          applicant: true,
        },
      });

      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      res.json(application);
    } catch (error) {
      next(error);
    }
  };

  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { jobId, resume } = req.body;

      const application = await prisma.application.create({
        data: {
          jobId: parseInt(jobId),
          applicantId: req.user.id,
          resume,
        },
        include: {
          job: true,
          applicant: true,
        },
      });

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  };

  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.body as { status: ApplicationStatusLocal };
      const applicationId = parseInt(req.params.id);

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true },
      });

      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      if (application.job.companyId !== req.user.companyId) {
        res
          .status(403)
          .json({ message: "Not authorized to update this application" });
        return;
      }

      if (!Object.values(ApplicationStatusLocal).includes(status)) {
        res.status(400).json({ message: "Invalid status value" });
        return;
      }

      const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
          job: true,
          applicant: true,
        },
      });

      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  };
}
