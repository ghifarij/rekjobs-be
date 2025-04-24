import {
  PrismaClient,
  Application,
  ApplicationStatus,
} from "../../prisma/generated/client";
import prisma from "../prisma";
import { EmailService } from "./email.service";

export class CompanyApplicationService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = prisma;
    this.emailService = new EmailService();
  }

  /**
   * Fetch all applications belonging to the company's jobs
   */
  public async getCompanyApplications(
    companyId: number
  ): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: { job: { companyId } },
      include: {
        job: { include: { company: true } },
        applicant: true,
        interviews: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch detailed application info, including applicant profile and interviews
   */
  public async getApplicationById(
    companyId: number,
    applicationId: number
  ): Promise<{
    id: number;
    status: ApplicationStatus;
    coverLetter: string | null;
    resume: string | null;
    job: { id: number; title: string; slug: string };
    applicant: {
      id: number;
      name: string;
      email: string;
      avatar: string | null;
      bio: string | null;
      phone: string | null;
      skills: string[];
      experience: Array<{
        title: string;
        company: string;
        location: string | null;
        startDate: string;
        endDate: string | null;
        current: boolean;
        description: string | null;
      }>;
      education: Array<{
        school: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate: string | null;
        current: boolean;
        description: string | null;
      }>;
    };
    interviews: Array<{
      id: number;
      scheduledAt: Date;
      status: string;
      notes: string | null;
    }>;
  }> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { id: true, title: true, slug: true, companyId: true } },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            phone: true,
            skills: true,
            experience: {
              select: {
                title: true,
                company: true,
                location: true,
                startDate: true,
                endDate: true,
                current: true,
                description: true,
              },
            },
            education: {
              select: {
                school: true,
                degree: true,
                fieldOfStudy: true,
                startDate: true,
                endDate: true,
                current: true,
                description: true,
              },
            },
          },
        },
        interviews: {
          select: { id: true, scheduledAt: true, status: true, notes: true },
        },
      },
    });

    if (!app) {
      throw new Error("Application not found");
    }
    if (app.job.companyId !== companyId) {
      throw new Error("Forbidden: you may only view your own applications");
    }

    return {
      id: app.id,
      status: app.status,
      coverLetter: app.coverLetter,
      resume: app.resume,
      job: { id: app.job.id, title: app.job.title, slug: app.job.slug },
      applicant: {
        id: app.applicant.id,
        name: app.applicant.name,
        email: app.applicant.email,
        avatar: app.applicant.avatar,
        bio: app.applicant.bio,
        phone: app.applicant.phone,
        skills: app.applicant.skills,
        experience: app.applicant.experience.map((e) => ({
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate ? e.endDate.toISOString() : null,
          current: e.current,
          description: e.description,
        })),
        education: app.applicant.education.map((ed) => ({
          school: ed.school,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          startDate: ed.startDate.toISOString(),
          endDate: ed.endDate ? ed.endDate.toISOString() : null,
          current: ed.current,
          description: ed.description,
        })),
      },
      interviews: app.interviews.map((i) => ({
        id: i.id,
        scheduledAt: i.scheduledAt,
        status: i.status,
        notes: i.notes,
      })),
    };
  }

  /**
   * Update the status of an application, ensuring company ownership
   */
  public async updateApplicationStatus(
    companyId: number,
    applicationId: number,
    status: ApplicationStatus
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true },
        },
        applicant: true,
        interviews: true,
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }
    if (application.job.companyId !== companyId) {
      throw new Error("You don't have permission to update this application");
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: { include: { company: true } },
        applicant: true,
        interviews: true,
      },
    });

    // Send email notification
    try {
      await this.emailService.sendApplicationStatusUpdate(
        updatedApplication,
        status
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't throw the error to prevent the status update from failing
    }

    return updatedApplication;
  }
}
