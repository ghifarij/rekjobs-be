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
exports.UserInterviewService = void 0;
// src/services/interview.service.ts
const client_1 = require("../../prisma/generated/client");
const prisma_1 = __importDefault(require("../prisma"));
class UserInterviewService {
    constructor() {
        this.prisma = prisma_1.default;
    }
    /**
     * Reschedule an existing interview. Only if it belongs to this company.
     *
     * @param interviewId   ID of the interview to reschedule
     * @param companyId     ID of the authenticated company
     * @param newDate       The new scheduled date/time
     * @param notes         Optional updated notes
     */
    requestRescheduleInterview(interviewId, applicantId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Load the interview and its applicantId
            const interview = yield this.prisma.interview.findUnique({
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
                    status: client_1.InterviewStatus.PENDING,
                },
            });
        });
    }
    acceptInterview(interviewId, applicantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const interview = yield this.prisma.interview.findUnique({
                where: { id: interviewId },
                include: { application: { select: { applicantId: true } } },
            });
            if (!interview)
                throw new Error("Interview not found");
            if (interview.application.applicantId !== applicantId) {
                throw new Error("Forbidden: you can only accept your own interviews");
            }
            return this.prisma.interview.update({
                where: { id: interviewId },
                data: { status: client_1.InterviewStatus.COMPLETED },
            });
        });
    }
}
exports.UserInterviewService = UserInterviewService;
//# sourceMappingURL=userInterview.service.js.map