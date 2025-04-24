// src/services/interview.service.ts
import {
  PrismaClient,
  Interview,
  InterviewStatus,
} from "../../prisma/generated/client";
import prisma from "../prisma";

export class CompanyInterviewService {
  private prisma = prisma as PrismaClient;

  /**
   * Schedule a new interview for an application.
   * @param applicationId   ID of the Application to which this interview belongs
   * @param scheduledAt     Date/time when the interview is set
   * @param notes           Optional notes or instructions for the interview
   * @returns The newly created Interview record
   */
  public async createInterview(
    applicationId: number,
    scheduledAt: Date,
    notes?: string
  ): Promise<Interview> {
    try {
      // ensure the application exists
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        select: { id: true },
      });
      if (!application) {
        throw new Error("Application not found");
      }

      // create the interview
      const interview = await this.prisma.interview.create({
        data: {
          application: { connect: { id: applicationId } },
          scheduledAt,
          notes,
          status: InterviewStatus.SCHEDULED,
        },
      });

      return interview;
    } catch (err) {
      console.error("Error scheduling interview:", err);
      throw err;
    }
  }

  public async getCompanyInterviews(companyId: number) {
    return this.prisma.interview.findMany({
      where: {
        application: {
          job: { companyId },
        },
      },
      include: {
        application: {
          select: {
            job: {
              select: { id: true, title: true, slug: true },
            },
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });
  }

  /**
   * Reschedule an existing interview. Only if it belongs to this company.
   *
   * @param interviewId   ID of the interview to reschedule
   * @param companyId     ID of the authenticated company
   * @param newDate       The new scheduled date/time
   * @param notes         Optional updated notes
   */
  public async rescheduleInterview(
    interviewId: number,
    companyId: number,
    newDate: Date,
    notes?: string
  ): Promise<Interview> {
    // 1) Load the interview and its job->companyId
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          select: {
            job: { select: { companyId: true } },
          },
        },
      },
    });
    if (!interview) {
      throw new Error("Interview not found");
    }

    // 2) Ensure that job belongs to this company
    if (interview.application.job.companyId !== companyId) {
      throw new Error(
        "Forbidden: cannot reschedule interviews for other companies"
      );
    }

    // 3) Update the interview
    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: newDate,
        notes,
        status: InterviewStatus.RESCHEDULED,
      },
    });
  }
}
