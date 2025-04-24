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
exports.AuthCompanyController = void 0;
const authCompany_service_1 = require("../../services/authCompany.service");
class AuthCompanyController {
    constructor() {
        this.loginCompany = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.authCompanyService.loginCompany(email, password);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.registerCompany = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.authCompanyService.registerCompany(email);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.verifyCompany = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, name, password, description, website, location, industry, size, } = req.body;
                const result = yield this.authCompanyService.verifyCompany(token, {
                    name,
                    password,
                    description,
                    website,
                    location,
                    industry,
                    size,
                });
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.socialLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Social login request body:", req.body);
                const { googleId, email, name, picture } = req.body;
                console.log("Extracted Google data:", { googleId, email, name, picture });
                const result = yield this.authCompanyService.socialLogin(googleId, email, name, picture);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.forgotPasswordCompany = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.authCompanyService.forgotPasswordCompany(email);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.resetPasswordCompany = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                const result = yield this.authCompanyService.resetPasswordCompany(token, password);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.checkVerificationStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                const result = yield this.authCompanyService.checkVerificationStatus(token);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.authCompanyService = new authCompany_service_1.AuthCompanyService();
    }
}
exports.AuthCompanyController = AuthCompanyController;
//# sourceMappingURL=authCompany.controller.js.map