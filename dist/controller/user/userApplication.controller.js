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
exports.UserApplicationController = void 0;
const userApplication_service_1 = require("../../services/userApplication.service");
class UserApplicationController {
    constructor() {
        this.applicationService = new userApplication_service_1.UserApplicationService();
        /** POST /api/applications */
        this.createApplication = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const applicantId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!applicantId)
                    throw new Error("User ID not found");
                const jobId = Number(req.body.jobId);
                if (!jobId)
                    throw new Error("Job ID is required");
                // Multer puts files on req.files as an object of arrays
                const files = req.files;
                const coverLetterFile = (_b = files === null || files === void 0 ? void 0 : files.coverLetter) === null || _b === void 0 ? void 0 : _b[0];
                const resumeFile = (_c = files === null || files === void 0 ? void 0 : files.resume) === null || _c === void 0 ? void 0 : _c[0];
                const application = yield this.applicationService.createApplication(applicantId, jobId, { coverLetterFile, resumeFile });
                res.status(201).json(application);
            }
            catch (err) {
                next(err);
            }
        });
        /** GET /api/applications */
        this.getUserApplications = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new Error("User ID not found");
                const applications = yield this.applicationService.getUserApplications(userId);
                res.json(applications);
            }
            catch (err) {
                next(err);
            }
        });
        /** DELETE /api/applications/:id */
        this.deleteApplication = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new Error("User ID not found");
                const applicationId = parseInt(req.params.id, 10);
                yield this.applicationService.deleteApplication(applicationId, userId);
                res.json({ message: "Application deleted successfully" });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.UserApplicationController = UserApplicationController;
//# sourceMappingURL=userApplication.controller.js.map