import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../prisma";

export class JobController {
  public getAllJobs: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const jobs = await prisma.job.findMany({
        where: { isActive: true },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: {
          [String(sort)]: String(order) as "asc" | "desc",
        },
        skip,
        take: Number(limit),
      });

      const total = await prisma.job.count({
        where: { isActive: true },
      });

      res.status(200).json({
        success: true,
        count: jobs.length,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  };

  public getJobById: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
              location: true,
              industry: true,
            },
          },
        },
      });

      if (!job) {
        res.status(404).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  };

  public createJob: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        title,
        description,
        location,
        requirements,
        salary,
        jobType,
        experience,
        deadline,
      } = req.body;

      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          requirements,
          salary,
          jobType,
          experience,
          deadline: new Date(deadline),
          companyId: req.user.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateJob: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        title,
        description,
        location,
        requirements,
        salary,
        jobType,
        experience,
        deadline,
        isActive,
      } = req.body;
      const jobId = parseInt(req.params.id);

      // Check if job exists and belongs to company
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        res.status(404).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      if (job.companyId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: "Not authorized to update this job",
        });
        return;
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          title,
          description,
          location,
          requirements,
          salary,
          jobType,
          experience,
          deadline: deadline ? new Date(deadline) : undefined,
          isActive,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: updatedJob,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteJob: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const jobId = parseInt(req.params.id);

      // Check if job exists and belongs to company
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        res.status(404).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      if (job.companyId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: "Not authorized to delete this job",
        });
        return;
      }

      // Soft delete by setting isActive to false
      await prisma.job.update({
        where: { id: jobId },
        data: { isActive: false },
      });

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };

  public searchJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        keyword,
        location,
        jobType,
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: any = { isActive: true };

      if (keyword) {
        where.OR = [
          { title: { contains: String(keyword), mode: "insensitive" } },
          { description: { contains: String(keyword), mode: "insensitive" } },
          { requirements: { contains: String(keyword), mode: "insensitive" } },
        ];
      }

      if (location) {
        where.location = { contains: String(location), mode: "insensitive" };
      }

      if (jobType) {
        where.jobType = String(jobType);
      }

      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: {
          [String(sort)]: String(order) as "asc" | "desc",
        },
        skip,
        take: Number(limit),
      });

      const total = await prisma.job.count({ where });

      res.status(200).json({
        success: true,
        count: jobs.length,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  };
}
