// src/services/interview.service.ts
import {
  PrismaClient,
  Interview,
  InterviewStatus,
} from "../../prisma/generated/client";
import prisma from "../prisma";

export class UserInterviewService {
  private prisma = prisma as PrismaClient;

  /**
   * Reschedule an existing interview. Only if it belongs to this company.
   *
   * @param interviewId   ID of the interview to reschedule
   * @param companyId     ID of the authenticated company
   * @param newDate       The new scheduled date/time
   * @param notes         Optional updated notes
   */
  public async requestRescheduleInterview(
    interviewId: number,
    applicantId: number
  ): Promise<Interview> {
    // 1) Load the interview and its applicantId
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          select: {
            applicantId: true,
          },
        },
      },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    // 2) Ensure that this user actually is the applicant
    if (interview.application.applicantId !== applicantId) {
      throw new Error("Forbidden: you can only reschedule your own interviews");
    }

    // 3) Update the interview record
    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: InterviewStatus.PENDING,
      },
    });
  }

  public async acceptInterview(
    interviewId: number,
    applicantId: number
  ): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: { select: { applicantId: true } } },
    });
    if (!interview) throw new Error("Interview not found");
    if (interview.application.applicantId !== applicantId) {
      throw new Error("Forbidden: you can only accept your own interviews");
    }
    return this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: InterviewStatus.COMPLETED },
    });
  }
}
