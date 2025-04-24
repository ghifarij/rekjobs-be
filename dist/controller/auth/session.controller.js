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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = __importDefault(require("../../prisma"));
class SessionController {
    getSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
                    res.status(401).json({ message: "Unauthorized: No token provided" });
                    return;
                }
                const token = authHeader.split(" ")[1];
                const payload = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                // Ensure both id and type exist
                if (!payload || !payload.id || !payload.type) {
                    res
                        .status(401)
                        .json({ message: "Unauthorized: Invalid token payload" });
                    return;
                }
                // Use payload.id and payload.type to fetch the appropriate record
                if (payload.type === "user") {
                    const user = yield prisma_1.default.user.findUnique({
                        where: { id: payload.id },
                    });
                    if (!user) {
                        res.status(404).json({ message: "User not found" });
                        return;
                    }
                    res.status(200).json({
                        type: "user",
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        isVerified: user.isVerified,
                        googleId: user.googleId,
                    });
                }
                else if (payload.type === "company") {
                    const company = yield prisma_1.default.company.findUnique({
                        where: { id: payload.id },
                    });
                    if (!company) {
                        res.status(404).json({ message: "Company not found" });
                        return;
                    }
                    res.status(200).json({
                        type: "company",
                        id: company.id,
                        name: company.name,
                        email: company.email,
                        logo: company.logo,
                        isVerified: company.isVerified,
                        googleId: company.googleId,
                    });
                }
                else {
                    res.status(403).json({ message: "Forbidden: Unknown session type" });
                }
            }
            catch (err) {
                console.error("Session error:", err);
                res
                    .status(401)
                    .json({ message: "Unauthorized: Invalid or expired token" });
            }
        });
    }
}
exports.SessionController = SessionController;
//# sourceMappingURL=session.controller.js.map