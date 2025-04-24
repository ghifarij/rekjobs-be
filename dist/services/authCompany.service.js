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
exports.AuthCompanyService = void 0;
const client_1 = require("../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const email_1 = require("../utils/email");
const resetPasswordEmail_1 = require("../utils/resetPasswordEmail");
class AuthCompanyService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    loginCompany(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield this.prisma.company.findUnique({ where: { email } });
            if (!company) {
                throw new Error("Company not found");
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, company.password);
            if (!isValidPassword) {
                throw new Error("Invalid password");
            }
            const token = jsonwebtoken_1.default.sign({ id: company.id, type: "company" }, process.env.JWT_KEY, {
                expiresIn: "1d",
            });
            return {
                token,
                company: {
                    id: company.id,
                    email: company.email,
                    name: company.name,
                    logo: company.logo,
                },
            };
        });
    }
    registerCompany(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCompany = yield this.prisma.company.findUnique({
                where: { email },
            });
            if (existingCompany) {
                throw new Error("Email already registered");
            }
            const verificationToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_KEY, {
                expiresIn: "1h",
            });
            // Create company with verification token and default values
            yield this.prisma.company.create({
                data: {
                    email,
                    name: "", // Will be set during verification
                    password: "", // Will be set during verification
                    verificationToken,
                    isVerified: false,
                },
            });
            yield (0, email_1.sendCompanyVerificationEmail)(email, verificationToken);
            return {
                message: "Verification email sent",
            };
        });
    }
    verifyCompany(token, companyData) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const company = yield this.prisma.company.findFirst({
                where: {
                    email: decoded.email,
                    verificationToken: token,
                    isVerified: false,
                },
            });
            if (!company) {
                throw new Error("Invalid or expired verification token");
            }
            const hashedPassword = yield bcrypt_1.default.hash(companyData.password, 10);
            yield this.prisma.company.update({
                where: { id: company.id },
                data: {
                    isVerified: true,
                    name: companyData.name,
                    password: hashedPassword,
                    description: companyData.description || null,
                    website: companyData.website || null,
                    location: companyData.location || null,
                    industry: companyData.industry || null,
                    size: companyData.size || null,
                    verificationToken: null, // Clear the verification token after successful verification
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
                // First check if company exists with this email
                const existingCompany = yield this.prisma.company.findFirst({
                    where: { email },
                });
                if (existingCompany) {
                    if (!existingCompany.googleId) {
                        throw new Error("Email already registered with password. Please use email login instead.");
                    }
                    if (existingCompany.googleId !== String(googleId)) {
                        throw new Error("This email is already registered with a different Google account.");
                    }
                }
                // Find company by Google ID
                let company = yield this.prisma.company.findFirst({
                    where: { googleId },
                });
                if (!company) {
                    if (!email) {
                        throw new Error("Email is required for new company registration");
                    }
                    console.log("Company not found with Google ID, creating new company");
                    // Create new company with Google ID and provided info
                    company = yield this.prisma.company.create({
                        data: {
                            email: email,
                            name: name || `Google Company ${googleId.substring(0, 8)}`,
                            password: yield bcrypt_1.default.hash(Math.random().toString(36), 10),
                            isVerified: true,
                            googleId: String(googleId),
                            logo: picture || null,
                        },
                    });
                    console.log("Created new company:", company);
                }
                else {
                    console.log("Found existing company:", company);
                    // Update company info if provided
                    if (email || name || picture) {
                        company = yield this.prisma.company.update({
                            where: { id: company.id },
                            data: Object.assign(Object.assign(Object.assign({}, (email && { email })), (name && { name })), (picture && { logo: picture })),
                        });
                        console.log("Updated company info:", company);
                    }
                }
                // Using id instead of userId for consistency
                const jwtToken = jsonwebtoken_1.default.sign({ id: company.id, type: "company" }, process.env.JWT_KEY, {
                    expiresIn: "1d",
                });
                return {
                    token: jwtToken,
                    company: {
                        id: company.id,
                        email: company.email,
                        name: company.name,
                        logo: company.logo,
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
    forgotPasswordCompany(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield this.prisma.company.findUnique({ where: { email } });
            if (!company) {
                throw new Error("Company not found");
            }
            const resetToken = jsonwebtoken_1.default.sign({ id: company.id }, process.env.JWT_KEY, {
                expiresIn: "1h",
            });
            const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/company/reset-password?token=${resetToken}`;
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
    resetPasswordCompany(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const company = yield this.prisma.company.findUnique({
                where: { id: decoded.id },
            });
            if (!company) {
                throw new Error("Company not found");
            }
            if (!company.resetPasswordToken || company.resetPasswordToken !== token) {
                throw new Error("Invalid or expired reset token");
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield this.prisma.company.update({
                where: { id: company.id },
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
            const company = yield this.prisma.company.findUnique({
                where: { email: decoded.email },
            });
            if (!company) {
                throw new Error("Company not found");
            }
            return {
                isVerified: company.isVerified,
                email: company.email,
            };
        });
    }
}
exports.AuthCompanyService = AuthCompanyService;
//# sourceMappingURL=authCompany.service.js.map