import {
  PrismaClient,
  Application,
  ApplicationStatus,
} from "../../prisma/generated/client";
import prisma from "../prisma";
import { uploadApplicationFile } from "./uploadService";

export class UserApplicationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Create a new application
  public async createApplication(
    applicantId: number,
    jobId: number,
    files: {
      coverLetterFile?: Express.Multer.File;
      resumeFile?: Express.Multer.File;
    }
  ): Promise<Application> {
    // 1) basic existence checks…
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    const user = await this.prisma.user.findUnique({
      where: { id: applicantId },
    });
    if (!user) throw new Error("User not found");

    if (
      await this.prisma.application.findFirst({
        where: { applicantId, jobId },
      })
    ) {
      throw new Error("You have already applied for this job");
    }

    // 2) upload to Cloudinary
    let coverUrl: string | undefined;
    let resumeUrl: string | undefined;

    if (files.coverLetterFile) {
      coverUrl = await uploadApplicationFile(
        files.coverLetterFile,
        "applications"
      );
    }
    if (files.resumeFile) {
      resumeUrl = await uploadApplicationFile(files.resumeFile, "applications");
    }

    // 3) create the record with the returned secure URLs
    return this.prisma.application.create({
      data: {
        coverLetter: coverUrl,
        resume: resumeUrl,
        status: ApplicationStatus.PENDING,
        job: { connect: { id: jobId } },
        applicant: { connect: { id: applicantId } },
      },
      include: {
        job: { include: { company: true } },
        applicant: true,
      },
    });
  }

  // Get all applications for a user
  public async getUserApplications(userId: number): Promise<Application[]> {
    try {
      const applications = await this.prisma.application.findMany({
        where: {
          applicantId: userId,
        },
        include: {
          job: {
            include: {
              company: true,
            },
          },
          interviews: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return applications;
    } catch (error) {
      console.error("Error fetching user applications:", error);
      throw error;
    }
  }

  // Delete an application (only the applicant can delete their own application)
  public async deleteApplication(
    applicationId: number,
    userId: number
  ): Promise<void> {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new Error("Application not found");
      }

      // Check if the user is the applicant
      if (application.applicantId !== userId) {
        throw new Error("You don't have permission to delete this application");
      }

      // Delete the application
      await this.prisma.application.delete({
        where: { id: applicationId },
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }
}
