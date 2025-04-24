"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyJobRouter = void 0;
const express_1 = require("express");
const companyJob_controller_1 = require("../../controller/job/companyJob.controller");
const verify_company_1 = require("../../middleware/verify.company");
class CompanyJobRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.companyJobController = new companyJob_controller_1.CompanyJobController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create a new job
        this.router.post("/", verify_company_1.verifyTokenCompany, this.companyJobController.createJob);
        // Get all jobs for the company
        this.router.get("/", verify_company_1.verifyTokenCompany, this.companyJobController.getJobs);
        this.router.get("/:id", verify_company_1.verifyTokenCompany, this.companyJobController.getJobById);
        // Update a job
        this.router.put("/:id", verify_company_1.verifyTokenCompany, this.companyJobController.updateJob);
        // Delete a job
        this.router.delete("/:id", verify_company_1.verifyTokenCompany, this.companyJobController.deleteJob);
    }
    getRouter() {
        return this.router;
    }
}
exports.CompanyJobRouter = CompanyJobRouter;
//# sourceMappingURL=companyJob.router.js.map