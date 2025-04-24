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
exports.CompanyApplicationService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const email_service_1 = require("./email.service");
class CompanyApplicationService {
    constructor() {
        this.prisma = prisma_1.default;
        this.emailService = new email_service_1.EmailService();
    }
    /**
     * Fetch all applications belonging to the company's jobs
     */
    getCompanyApplications(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.application.findMany({
                where: { job: { companyId } },
                include: {
                    job: { include: { company: true } },
                    applicant: true,
                    interviews: true,
                },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    /**
     * Fetch detailed application info, including applicant profile and interviews
     */
    getApplicationById(companyId, applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.prisma.application.findUnique({
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
        });
    }
    /**
     * Update the status of an application, ensuring company ownership
     */
    updateApplicationStatus(companyId, applicationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.prisma.application.findUnique({
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
            const updatedApplication = yield this.prisma.application.update({
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
                yield this.emailService.sendApplicationStatusUpdate(updatedApplication, status);
            }
            catch (error) {
                console.error("Failed to send email notification:", error);
                // Don't throw the error to prevent the status update from failing
            }
            return updatedApplication;
        });
    }
}
exports.CompanyApplicationService = CompanyApplicationService;
//# sourceMappingURL=companyApplication.service.js.map