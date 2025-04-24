"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInterviewRouter = void 0;
const express_1 = require("express");
const verify_company_1 = require("../../middleware/verify.company");
const companyInterview_controller_1 = require("../../controller/company/companyInterview.controller");
class CompanyInterviewRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.companyInterviewController = new companyInterview_controller_1.CompanyInterviewController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", verify_company_1.verifyTokenCompany, this.companyInterviewController.createInterview);
        this.router.get("/", verify_company_1.verifyTokenCompany, this.companyInterviewController.getCompanyInterviews);
        this.router.patch("/:id", verify_company_1.verifyTokenCompany, this.companyInterviewController.reschedule);
    }
    getRouter() {
        return this.router;
    }
}
exports.CompanyInterviewRouter = CompanyInterviewRouter;
//# sourceMappingURL=companyInterview.router.js.map