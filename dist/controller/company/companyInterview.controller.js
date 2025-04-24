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
exports.CompanyInterviewController = void 0;
const companyInterview_service_1 = require("../../services/companyInterview.service");
class CompanyInterviewController {
    constructor() {
        this.createInterview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { applicationId, scheduledAt, notes } = req.body;
                const interview = yield this.companyInterviewService.createInterview(Number(applicationId), new Date(scheduledAt), notes);
                res.status(201).json(interview);
            }
            catch (err) {
                next(err);
            }
        });
        this.getCompanyInterviews = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    res.sendStatus(401);
                    return;
                }
                const interviews = yield this.companyInterviewService.getCompanyInterviews(companyId);
                res.status(200).json(interviews);
            }
            catch (err) {
                next(err);
            }
        });
        // POST /api/interviews/company/:id/reschedule
        this.reschedule = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const companyId = req.company.id;
                const interviewId = Number(req.params.id);
                const { scheduledAt, notes } = req.body;
                const updated = yield this.companyInterviewService.rescheduleInterview(interviewId, companyId, new Date(scheduledAt), notes);
                res.status(200).json(updated);
            }
            catch (err) {
                next(err);
            }
        });
        this.companyInterviewService = new companyInterview_service_1.CompanyInterviewService();
    }
}
exports.CompanyInterviewController = CompanyInterviewController;
//# sourceMappingURL=companyInterview.controller.js.map