import { Request, Response, NextFunction } from "express";
import { JobService } from "../../services/job.service";
import { RequestHandler } from "express";

interface CompanyRequest extends Request {
  company?: {
    id: number;
  };
}

export class CompanyJobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  public createJob: RequestHandler = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const jobData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        requirements: req.body.requirements,
        salary: req.body.salary,
        jobType: req.body.jobType,
        experience: req.body.experience,
        deadline: new Date(req.body.deadline),
      };

      const job = await this.jobService.createJob(companyId, jobData);
      res.json(job);
    } catch (error) {
      next(error);
    }
  };

  public updateJob: RequestHandler = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const jobId = parseInt(req.params.id);
      const jobData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        requirements: req.body.requirements,
        salary: req.body.salary,
        jobType: req.body.jobType,
        experience: req.body.experience,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
        isActive: req.body.isActive,
      };

      const job = await this.jobService.updateJob(jobId, companyId, jobData);
      res.json(job);
    } catch (error) {
      next(error);
    }
  };

  public deleteJob: RequestHandler = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const jobId = parseInt(req.params.id);
      await this.jobService.deleteJob(jobId, companyId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getJobs: RequestHandler = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const jobs = await this.jobService.getCompanyJobs(companyId);
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  };
}
