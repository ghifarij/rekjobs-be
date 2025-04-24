"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../../controller/user/user.controller");
const verify_user_1 = require("../../middleware/verify.user");
class UserRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.UserController = new user_controller_1.UserController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_user_1.verifyTokenUser, this.UserController.getProfile);
        this.router.put("/", verify_user_1.verifyTokenUser, this.UserController.updateProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
//# sourceMappingURL=user.router.js.map