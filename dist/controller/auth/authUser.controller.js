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
exports.AuthUserController = void 0;
const authUser_service_1 = require("../../services/authUser.service");
class AuthUserController {
    constructor() {
        this.loginUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.authUserService.loginUser(email, password);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.registerUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.authUserService.registerUser(email);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.verifyUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, username, password, no_handphone } = req.body;
                const result = yield this.authUserService.verifyUser(token, {
                    username,
                    password,
                    no_handphone,
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
                const result = yield this.authUserService.socialLogin(googleId, email, name, picture);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.forgotPasswordUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.authUserService.forgotPassword(email);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.resetPasswordUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                const result = yield this.authUserService.resetPassword(token, password);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.checkVerificationStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                const result = yield this.authUserService.checkVerificationStatus(token);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.authUserService = new authUser_service_1.AuthUserService();
    }
}
exports.AuthUserController = AuthUserController;
//# sourceMappingURL=authUser.controller.js.map