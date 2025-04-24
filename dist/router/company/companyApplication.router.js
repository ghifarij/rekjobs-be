"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyApplicationRouter = void 0;
const express_1 = require("express");
const companyApplication_controller_1 = require("../../controller/company/companyApplication.controller");
const verify_company_1 = require("../../middleware/verify.company");
class CompanyApplicationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.companyApplicationController = new companyApplication_controller_1.CompanyApplicationController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get all applications for a specific job (company)
        this.router.get("/", verify_company_1.verifyTokenCompany, this.companyApplicationController.getCompanyApplications);
        // Get a single application by ID (user or company)
        this.router.get("/:id", verify_company_1.verifyTokenCompany, this.companyApplicationController.getApplicationById);
        // Update application status (company)
        this.router.patch("/:id/status", verify_company_1.verifyTokenCompany, this.companyApplicationController.updateApplicationStatus);
    }
    getRouter() {
        return this.router;
    }
}
exports.CompanyApplicationRouter = CompanyApplicationRouter;
//# sourceMappingURL=companyApplication.router.js.map