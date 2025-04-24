"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInterviewService = void 0;
// src/services/interview.service.ts
const client_1 = require("../../prisma/generated/client");
const prisma_1 = __importDefault(require("../prisma"));
class CompanyInterviewService {
    constructor() {
        this.prisma = prisma_1.default;
    }
    /**
     * Schedule a new interview for an application.
     * @param applicationId   ID of the Application to which this interview belongs
     * @param scheduledAt     Date/time when the interview is set
     * @param notes           Optional notes or instructions for the interview
     * @returns The newly created Interview record
     */
    createInterview(applicationId, scheduledAt, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // ensure the application exists
                const application = yield this.prisma.application.findUnique({
                    where: { id: applicationId },
                    select: { id: true },
                });
                if (!application) {
                    throw new Error("Application not found");
                }
                // create the interview
                const interview = yield this.prisma.interview.create({
                    data: {
                        application: { connect: { id: applicationId } },
                        scheduledAt,
                        notes,
                        status: client_1.InterviewStatus.SCHEDULED,
                    },
                });
                return interview;
            }
            catch (err) {
                console.error("Error scheduling interview:", err);
                throw err;
            }
        });
    }
    getCompanyInterviews(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
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
    rescheduleInterview(interviewId, companyId, newDate, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Load the interview and its job->companyId
            const interview = yield this.prisma.interview.findUnique({
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
                throw new Error("Forbidden: cannot reschedule interviews for other companies");
            }
            // 3) Update the interview
            return this.prisma.interview.update({
                where: { id: interviewId },
                data: {
                    scheduledAt: newDate,
                    notes,
                    status: client_1.InterviewStatus.RESCHEDULED,
                },
            });
        });
    }
}
exports.CompanyInterviewService = CompanyInterviewService;
//# sourceMappingURL=companyInterview.service.js.map