"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInterviewRouter = void 0;
const express_1 = require("express");
const userInterview_controller_1 = require("../../controller/user/userInterview.controller");
const verify_user_1 = require("../../middleware/verify.user");
class UserInterviewRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userInterviewController = new userInterview_controller_1.UserInterviewController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch("/:id/reschedule", verify_user_1.verifyTokenUser, this.userInterviewController.requestReschedule);
        this.router.patch("/:id/accept", verify_user_1.verifyTokenUser, this.userInterviewController.acceptInterview);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserInterviewRouter = UserInterviewRouter;
//# sourceMappingURL=userInterview.router.js.map