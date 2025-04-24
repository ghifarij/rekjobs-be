"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCompanyRouter = void 0;
const express_1 = require("express");
const authCompany_controller_1 = require("../../controller/auth/authCompany.controller");
class AuthCompanyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authCompanyController = new authCompany_controller_1.AuthCompanyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Login and Register
        this.router.post("/login", this.authCompanyController.loginCompany);
        this.router.post("/register", this.authCompanyController.registerCompany);
        // Email Verification
        this.router.post("/verify", this.authCompanyController.verifyCompany);
        this.router.post("/check-verification", this.authCompanyController.checkVerificationStatus);
        // Social Login
        this.router.post("/social-login", this.authCompanyController.socialLogin);
        // Password Reset
        this.router.post("/forgot-password", this.authCompanyController.forgotPasswordCompany);
        this.router.post("/reset-password", this.authCompanyController.resetPasswordCompany);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthCompanyRouter = AuthCompanyRouter;
//# sourceMappingURL=authCompany.router.js.map