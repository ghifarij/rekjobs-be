"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRouter = void 0;
const express_1 = require("express");
const company_controller_1 = require("../../controller/company/company.controller");
const verify_company_1 = require("../../middleware/verify.company");
class CompanyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.companyController = new company_controller_1.CompanyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_company_1.verifyTokenCompany, this.companyController.getProfile);
        this.router.put("/", verify_company_1.verifyTokenCompany, this.companyController.updateProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.CompanyRouter = CompanyRouter;
//# sourceMappingURL=company.router.js.map