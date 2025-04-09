import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export class InterviewController {
  async scheduleInterview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { applicationId, scheduledAt } = req.body;

      // Check if application exists and belongs to company's job
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            select: {
              companyId: true,
            },
          },
        },
      });

      if (!application) {
        res.status(404).json({
          success: false,
          message: "Application not found",
        });
        return;
      }

      if (application.job.companyId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: "Not authorized to schedule interview for this application",
        });
        return;
      }

      const interview = await prisma.interview.create({
        data: {
          applicationId,
          scheduledAt: new Date(scheduledAt),
        },
        include: {
          application: {
            include: {
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              applicant: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInterviewStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.body;
      const interviewId = parseInt(req.params.id);

      // Check if interview exists
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          application: {
            include: {
              job: {
                select: {
                  companyId: true,
                },
              },
              applicant: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!interview) {
        res.status(404).json({
          success: false,
          message: "Interview not found",
        });
        return;
      }

      // Check if user is authorized to update the interview status
      if (
        (req.user.role === "COMPANY" &&
          interview.application.job.companyId !== req.user.id) ||
        (req.user.role === "JOB_SEEKER" &&
          interview.application.applicant.id !== req.user.id)
      ) {
        res.status(403).json({
          success: false,
          message: "Not authorized to update this interview",
        });
        return;
      }

      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: { status },
        include: {
          application: {
            include: {
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              applicant: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: updatedInterview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          application: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                      logo: true,
                    },
                  },
                },
              },
              applicant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (!interview) {
        res.status(404).json({
          success: false,
          message: "Interview not found",
        });
        return;
      }

      // Check if user is authorized to view the interview
      if (
        (req.user.role === "COMPANY" &&
          interview.application.job.company.id !== req.user.id) ||
        (req.user.role === "JOB_SEEKER" &&
          interview.application.applicant.id !== req.user.id)
      ) {
        res.status(403).json({
          success: false,
          message: "Not authorized to view this interview",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyInterviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const interviews = await prisma.interview.findMany({
        where: {
          application: {
            job: {
              companyId: req.user.id,
            },
          },
        },
        include: {
          application: {
            include: {
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              applicant: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          scheduledAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserInterviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const interviews = await prisma.interview.findMany({
        where: {
          application: {
            applicantId: req.user.id,
          },
        },
        include: {
          application: {
            include: {
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true,
                      logo: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          scheduledAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      next(error);
    }
  }
}
