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
exports.JobController = void 0;
const job_service_1 = require("../../services/job.service");
class JobController {
    constructor() {
        // Get all active jobs for the public job board/home page
        this.getAllJobs = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { search } = req.query;
                const jobs = yield this.jobService.getAllJobs(typeof search === "string" && search.length > 0 ? search : undefined);
                res.json(jobs);
            }
            catch (err) {
                next(err);
            }
        });
        this.getJobBySlug = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Instead of parsing an ID, we simply extract the slug from the URL parameter
                const slug = req.params.slug;
                if (!slug) {
                    res.status(400).json({ message: "Slug is required" });
                    return;
                }
                const job = yield this.jobService.getJobBySlug(slug);
                if (!job) {
                    res.status(404).json({ message: "Job not found" });
                    return;
                }
                res.status(200).json(job);
            }
            catch (error) {
                next(error);
            }
        });
        this.jobService = new job_service_1.JobService();
    }
}
exports.JobController = JobController;
//# sourceMappingURL=job.controller.js.map