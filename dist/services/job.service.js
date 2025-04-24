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
exports.JobService = void 0;
const client_1 = require("../../prisma/generated/client");
const slugify_1 = __importDefault(require("slugify"));
const prisma = new client_1.PrismaClient();
class JobService {
    createJob(companyId, jobData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate a base slug from the title
                const baseSlug = (0, slugify_1.default)(jobData.title, { lower: true, strict: true });
                // Append a random 6-character alphanumeric string to ensure uniqueness
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                const fullSlug = `${baseSlug}-${randomSuffix}`;
                const job = yield prisma.job.create({
                    data: Object.assign(Object.assign({}, jobData), { companyId, slug: fullSlug }),
                });
                return job;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateJob(jobId, companyId, jobData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = yield prisma.job.update({
                    where: {
                        id: jobId,
                        companyId,
                    },
                    data: jobData,
                });
                return job;
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteJob(jobId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.job.delete({
                    where: {
                        id: jobId,
                        companyId,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getCompanyJobs(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobs = yield prisma.job.findMany({
                    where: {
                        companyId, // Fetch jobs only for the specified company
                    },
                    include: {
                        applications: true, // Include applications in the response
                    },
                    orderBy: {
                        createdAt: "desc", // Optional: Order by creation date
                    },
                });
                return jobs;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getAllJobs(search) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { isActive: true };
            if (search) {
                const q = search.trim();
                where.OR = [
                    { title: { contains: q, mode: "insensitive" } },
                    { location: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ];
            }
            return prisma.job.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    // Get a detailed view of a single job for the user/applicant
    getJobBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = yield prisma.job.findUnique({
                    where: { slug },
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                email: true,
                            },
                        },
                        applications: {
                            // Optionally include applications if needed for a detailed view
                            select: { id: true, status: true },
                        },
                    },
                });
                return job;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getJobById(jobId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = yield prisma.job.findUnique({
                    where: { id: jobId },
                    include: {
                        applications: true,
                        company: true,
                    },
                });
                // Ensure the job belongs to the requesting company
                if (!job || job.companyId !== companyId) {
                    return null;
                }
                return job;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.JobService = JobService;
//# sourceMappingURL=job.service.js.map