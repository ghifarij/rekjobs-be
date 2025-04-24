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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyJobController = void 0;
const job_service_1 = require("../../services/job.service");
class CompanyJobController {
    constructor() {
        this.createJob = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const jobData = {
                    title: req.body.title,
                    description: req.body.description,
                    location: req.body.location,
                    requirements: req.body.requirements,
                    salary: req.body.salary,
                    jobType: req.body.jobType,
                    experience: req.body.experience,
                    deadline: new Date(req.body.deadline),
                };
                const job = yield this.jobService.createJob(companyId, jobData);
                res.json(job);
            }
            catch (error) {
                next(error);
            }
        });
        this.updateJob = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const jobId = parseInt(req.params.id);
                const jobData = {
                    title: req.body.title,
                    description: req.body.description,
                    location: req.body.location,
                    requirements: req.body.requirements,
                    salary: req.body.salary,
                    jobType: req.body.jobType,
                    experience: req.body.experience,
                    deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
                    isActive: req.body.isActive,
                };
                const job = yield this.jobService.updateJob(jobId, companyId, jobData);
                res.json(job);
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteJob = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const jobId = parseInt(req.params.id);
                yield this.jobService.deleteJob(jobId, companyId);
                res.json({ message: "Job deleted successfully" });
            }
            catch (error) {
                next(error);
            }
        });
        this.getJobs = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const jobs = yield this.jobService.getCompanyJobs(companyId);
                res.json(jobs);
            }
            catch (error) {
                next(error);
            }
        });
        this.getJobById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                const jobId = parseInt(req.params.id);
                if (!companyId)
                    throw new Error("Company ID not found");
                const job = yield this.jobService.getJobById(jobId, companyId);
                if (!job) {
                    res.status(404).json({ message: "Job not found or unauthorized" });
                    return;
                }
                res.json(job);
            }
            catch (err) {
                next(err);
            }
        });
        this.jobService = new job_service_1.JobService();
    }
}
exports.CompanyJobController = CompanyJobController;
//# sourceMappingURL=companyJob.controller.js.map