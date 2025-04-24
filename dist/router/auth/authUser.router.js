"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserRouter = void 0;
const express_1 = require("express");
const authUser_controller_1 = require("../../controller/auth/authUser.controller");
class AuthUserRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authUserController = new authUser_controller_1.AuthUserController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Login and Register
        this.router.post("/login", this.authUserController.loginUser);
        this.router.post("/register", this.authUserController.registerUser);
        // Email Verification
        this.router.post("/verify", this.authUserController.verifyUser);
        this.router.post("/check-verification", this.authUserController.checkVerificationStatus);
        // Social Login
        this.router.post("/social-login", this.authUserController.socialLogin);
        // Password Reset
        this.router.post("/forgot-password", this.authUserController.forgotPasswordUser);
        this.router.post("/reset-password", this.authUserController.resetPasswordUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthUserRouter = AuthUserRouter;
//# sourceMappingURL=authUser.router.js.map