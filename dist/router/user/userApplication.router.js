"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserApplicationRouter = void 0;
const express_1 = require("express");
const userApplication_controller_1 = require("../../controller/user/userApplication.controller");
const __1 = require("../..");
const verify_user_1 = require("../../middleware/verify.user");
class UserApplicationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userApplicationController = new userApplication_controller_1.UserApplicationController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const multiUpload = __1.upload.fields([
            { name: "coverLetter", maxCount: 1 },
            { name: "resume", maxCount: 1 },
        ]);
        // Create a new application (job seeker)
        this.router.post("/", verify_user_1.verifyTokenUser, multiUpload, this.userApplicationController.createApplication);
        // Get all applications for the current user
        this.router.get("/", verify_user_1.verifyTokenUser, this.userApplicationController.getUserApplications);
        // Delete an application (job seeker)
        this.router.delete("/:id", verify_user_1.verifyTokenUser, this.userApplicationController.deleteApplication);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserApplicationRouter = UserApplicationRouter;
//# sourceMappingURL=userApplication.router.js.map