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
exports.CompanyController = void 0;
const company_service_1 = require("../../services/company.service");
class CompanyController {
    constructor() {
        // Fetch the company's own profile
        this.getProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const profile = yield this.companyService.getProfile(companyId);
                if (!profile) {
                    res.status(404).json({ message: "Company not found" });
                    return;
                }
                res.status(200).json(profile);
            }
            catch (error) {
                next(error);
            }
        });
        // Update the company's own profile
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req.company) === null || _a === void 0 ? void 0 : _a.id;
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                const updateData = {
                    name: req.body.name,
                    description: req.body.description,
                    website: req.body.website,
                    logo: req.body.logo,
                    location: req.body.location,
                    industry: req.body.industry,
                    size: req.body.size,
                };
                if (req.body.password) {
                    updateData.password = req.body.password;
                }
                const updatedProfile = yield this.companyService.updateProfile(companyId, updateData);
                res.status(200).json(updatedProfile);
            }
            catch (error) {
                next(error);
            }
        });
        this.companyService = new company_service_1.CompanyService();
    }
}
exports.CompanyController = CompanyController;
//# sourceMappingURL=company.controller.js.map