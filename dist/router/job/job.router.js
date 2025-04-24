"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRouter = void 0;
const express_1 = require("express");
const job_controller_1 = require("../../controller/job/job.controller");
const verify_user_1 = require("../../middleware/verify.user");
class JobRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.jobController = new job_controller_1.JobController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_user_1.verifyTokenUser, this.jobController.getAllJobs);
        this.router.get("/:slug", verify_user_1.verifyTokenUser, this.jobController.getJobBySlug);
    }
    getRouter() {
        return this.router;
    }
}
exports.JobRouter = JobRouter;
//# sourceMappingURL=job.router.js.map