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
exports.CompanyApplicationController = void 0;
const companyApplication_service_1 = require("../../services/companyApplication.service");
class CompanyApplicationController {
    constructor() {
        this.companyApplicationService = new companyApplication_service_1.CompanyApplicationService();
        /** GET /api/applications/company */
        this.getCompanyApplications = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const applications = yield this.companyApplicationService.getCompanyApplications(companyId);
                res.status(200).json({ applications });
            }
            catch (err) {
                next(err);
            }
        });
        /** GET /api/applications/company/:id */
        this.getApplicationById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const applicationId = parseInt(req.params.id, 10);
                const details = yield this.companyApplicationService.getApplicationById(companyId, applicationId);
                res.status(200).json({ details });
            }
            catch (err) {
                next(err);
            }
        });
        /** PATCH /api/applications/company/:id/status */
        this.updateApplicationStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const applicationId = parseInt(req.params.id, 10);
                const { status } = req.body;
                // Enforce allowed statuses at service level or here if you prefer
                const updated = yield this.companyApplicationService.updateApplicationStatus(companyId, applicationId, status);
                res.status(200).json(updated);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.CompanyApplicationController = CompanyApplicationController;
//# sourceMappingURL=companyApplication.controller.js.map