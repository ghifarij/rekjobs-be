"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInterviewController = void 0;
const userInterview_service_1 = require("../../services/userInterview.service");
class UserInterviewController {
    constructor() {
        // POST /api/interviews/user/:id/reschedule
        this.requestReschedule = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const applicantId = req.user.id;
                const interviewId = Number(req.params.id);
                const updated = yield this.userInterviewService.requestRescheduleInterview(interviewId, applicantId);
                res.status(200).json(updated);
            }
            catch (err) {
                next(err);
            }
        });
        this.acceptInterview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield this.userInterviewService.acceptInterview(parseInt(req.params.id), req.user.id);
                res.status(200).json(updated);
            }
            catch (err) {
                next(err);
            }
        });
        this.userInterviewService = new userInterview_service_1.UserInterviewService();
    }
}
exports.UserInterviewController = UserInterviewController;
//# sourceMappingURL=userInterview.controller.js.map