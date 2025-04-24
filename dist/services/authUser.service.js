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
exports.AuthUserService = void 0;
const client_1 = require("../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const email_1 = require("../utils/email");
const resetPasswordEmail_1 = require("../utils/resetPasswordEmail");
class AuthUserService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error("User not found");
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error("Invalid password");
            }
            // Using id instead of userId for consistency
            const token = jsonwebtoken_1.default.sign({ id: user.id, type: "user" }, process.env.JWT_KEY, {
                expiresIn: "1d",
            });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
        });
    }
    registerUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new Error("Email already registered");
            }
            const verificationToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_KEY, {
                expiresIn: "1h",
            });
            // Create user with verification token and default values
            yield this.prisma.user.create({
                data: {
                    email,
                    name: "", // Will be set during verification
                    password: "", // Will be set during verification
                    verificationToken,
                    isVerified: false,
                },
            });
            yield (0, email_1.sendUserVerificationEmail)(email, verificationToken);
            return {
                message: "Verification email sent",
            };
        });
    }
    verifyUser(token, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const user = yield this.prisma.user.findUnique({
                where: { email: decoded.email },
            });
            if (!user) {
                throw new Error("User not found");
            }
            if (user.isVerified) {
                throw new Error("User already verified");
            }
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
            yield this.prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    name: userData.username,
                    password: hashedPassword,
                    phone: userData.no_handphone,
                },
            });
            return {
                message: "Account verified successfully",
            };
        });
    }
    socialLogin(googleId, email, name, picture) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!googleId) {
                    throw new Error("Google ID is required");
                }
                console.log("Processing social login for Google ID:", googleId);
                // First check if user exists with this email
                const existingUser = yield this.prisma.user.findFirst({
                    where: { email },
                });
                if (existingUser) {
                    if (!existingUser.googleId) {
                        throw new Error("Email already registered with password. Please use email login instead.");
                    }
                    if (existingUser.googleId !== String(googleId)) {
                        throw new Error("This email is already registered with a different Google account.");
                    }
                }
                // Find user by Google ID
                let user = yield this.prisma.user.findFirst({
                    where: { googleId },
                });
                if (!user) {
                    if (!email) {
                        throw new Error("Email is required for new user registration");
                    }
                    console.log("User not found with Google ID, creating new user");
                    // Create new user with Google ID and provided info
                    user = yield this.prisma.user.create({
                        data: {
                            email: email,
                            name: name || `Google User ${googleId.substring(0, 8)}`,
                            password: yield bcrypt_1.default.hash(Math.random().toString(36), 10),
                            isVerified: true,
                            googleId: String(googleId),
                            avatar: picture || null,
                        },
                    });
                    console.log("Created new user:", user);
                }
                else {
                    console.log("Found existing user:", user);
                    // Update user info if provided
                    if (email || name || picture) {
                        user = yield this.prisma.user.update({
                            where: { id: user.id },
                            data: Object.assign(Object.assign(Object.assign({}, (email && { email })), (name && { name })), (picture && { avatar: picture })),
                        });
                        console.log("Updated user info:", user);
                    }
                }
                // Using id instead of userId for consistency
                const jwtToken = jsonwebtoken_1.default.sign({ id: user.id, type: "user" }, process.env.JWT_KEY, {
                    expiresIn: "1d",
                });
                return {
                    token: jwtToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        avatar: user.avatar,
                    },
                    message: "Login successful",
                };
            }
            catch (error) {
                console.error("Social login error:", error);
                throw error;
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error("User not found");
            }
            const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_KEY, {
                expiresIn: "1h",
            });
            const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/user/reset-password?token=${resetToken}`;
            yield (0, email_1.sendEmail)({
                to: email,
                subject: "Reset Password Anda - RekJobs",
                html: (0, resetPasswordEmail_1.resetPasswordEmailTemplate)(resetLink),
                text: `Untuk mereset password Anda, silakan kunjungi link berikut: ${resetLink}`,
            });
            return {
                message: "Email reset password berhasil dikirim",
            };
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const user = yield this.prisma.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                throw new Error("User not found");
            }
            if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
                throw new Error("Invalid or expired reset token");
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null, // Clear the token after use
                    resetPasswordExpires: null,
                },
            });
            return {
                message: "Password reset successfully",
            };
        });
    }
    checkVerificationStatus(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const user = yield this.prisma.user.findUnique({
                where: { email: decoded.email },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return {
                isVerified: user.isVerified,
                email: user.email,
            };
        });
    }
}
exports.AuthUserService = AuthUserService;
//# sourceMappingURL=authUser.service.js.map