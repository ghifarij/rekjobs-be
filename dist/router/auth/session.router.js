"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRouter = void 0;
const express_1 = require("express");
const session_controller_1 = require("../../controller/auth/session.controller");
class SessionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.sessionController = new session_controller_1.SessionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.sessionController.getSession);
    }
    getRouter() {
        return this.router;
    }
}
exports.SessionRouter = SessionRouter;
//# sourceMappingURL=session.router.js.map