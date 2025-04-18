// src/controllers/publicJob.controller.ts
import { Request, Response, NextFunction } from "express";
import { JobService } from "../../services/job.service";
import { RequestHandler } from "express";

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  // Get all active jobs for the public job board/home page
  public getAllJobs: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const jobs = await this.jobService.getAllJobs();
      res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  };

  public getJobBySlug: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Instead of parsing an ID, we simply extract the slug from the URL parameter
      const slug = req.params.slug;
      if (!slug) {
        res.status(400).json({ message: "Slug is required" });
        return;
      }

      const job = await this.jobService.getJobBySlug(slug);
      if (!job) {
        res.status(404).json({ message: "Job not found" });
        return;
      }
      res.status(200).json(job);
    } catch (error) {
      next(error);
    }
  };
}
