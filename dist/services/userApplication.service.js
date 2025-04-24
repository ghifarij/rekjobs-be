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
exports.UserApplicationService = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma_1 = __importDefault(require("../prisma"));
const uploadService_1 = require("./uploadService");
class UserApplicationService {
    constructor() {
        this.prisma = prisma_1.default;
    }
    // Create a new application
    createApplication(applicantId, jobId, files) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) basic existence checks…
            const job = yield this.prisma.job.findUnique({ where: { id: jobId } });
            if (!job)
                throw new Error("Job not found");
            const user = yield this.prisma.user.findUnique({
                where: { id: applicantId },
            });
            if (!user)
                throw new Error("User not found");
            if (yield this.prisma.application.findFirst({
                where: { applicantId, jobId },
            })) {
                throw new Error("You have already applied for this job");
            }
            // 2) upload to Cloudinary
            let coverUrl;
            let resumeUrl;
            if (files.coverLetterFile) {
                coverUrl = yield (0, uploadService_1.uploadApplicationFile)(files.coverLetterFile, "applications");
            }
            if (files.resumeFile) {
                resumeUrl = yield (0, uploadService_1.uploadApplicationFile)(files.resumeFile, "applications");
            }
            // 3) create the record with the returned secure URLs
            return this.prisma.application.create({
                data: {
                    coverLetter: coverUrl,
                    resume: resumeUrl,
                    status: client_1.ApplicationStatus.PENDING,
                    job: { connect: { id: jobId } },
                    applicant: { connect: { id: applicantId } },
                },
                include: {
                    job: { include: { company: true } },
                    applicant: true,
                },
            });
        });
    }
    // Get all applications for a user
    getUserApplications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield this.prisma.application.findMany({
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
            }
            catch (error) {
                console.error("Error fetching user applications:", error);
                throw error;
            }
        });
    }
    // Delete an application (only the applicant can delete their own application)
    deleteApplication(applicationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.prisma.application.findUnique({
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
                yield this.prisma.application.delete({
                    where: { id: applicationId },
                });
            }
            catch (error) {
                console.error("Error deleting application:", error);
                throw error;
            }
        });
    }
}
exports.UserApplicationService = UserApplicationService;
//# sourceMappingURL=userApplication.service.js.map