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
exports.UserController = void 0;
const user_service_1 = require("../../services/user.service");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        /** GET /api/user/profile */
        this.getProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new Error("User ID not found");
                const profile = yield this.userService.getProfile(userId);
                if (!profile) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(profile);
            }
            catch (err) {
                next(err);
            }
        });
        /** PUT /api/user/profile */
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new Error("User ID not found");
                // Destructure everything you expect from the client
                const { name, phone, bio, avatar, skills, password, experience, education, } = req.body;
                // Build up the payload for your service
                const updateData = {
                    name,
                    phone,
                    bio,
                    avatar,
                    skills,
                    password,
                };
                if (experience)
                    updateData.experience = experience;
                if (education)
                    updateData.education = education;
                const updated = yield this.userService.updateProfile(userId, updateData);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map