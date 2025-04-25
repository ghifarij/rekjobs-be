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
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = require("bcryptjs");
class UserService {
    constructor() {
        this.prisma = prisma_1.default;
    }
    /**
     * Fetch only the authenticated user's own profile fields
     */
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    bio: true,
                    avatar: true,
                    skills: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    experience: {
                        select: {
                            id: true,
                            title: true,
                            company: true,
                            location: true,
                            startDate: true,
                            endDate: true,
                            current: true,
                            description: true,
                        },
                    },
                    education: {
                        select: {
                            id: true,
                            school: true,
                            degree: true,
                            fieldOfStudy: true,
                            startDate: true,
                            endDate: true,
                            current: true,
                            description: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Update only the authenticated user's own profile data
     */
    updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // clone the update payload
            const updates = Object.assign({}, data);
            delete updates.experience;
            delete updates.education;
            // if a new password is provided, hash it
            if (updates.password) {
                updates.password = yield (0, bcryptjs_1.hash)(updates.password, 10);
            }
            // Start a transaction to update user profile and related data
            const updated = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Update user profile
                yield tx.user.update({
                    where: { id: userId },
                    data: updates,
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        bio: true,
                        avatar: true,
                        skills: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                // Handle experience updates if provided
                if (data.experience) {
                    // Delete existing experience entries
                    yield tx.experience.deleteMany({
                        where: { userId },
                    });
                    // Create new experience entries
                    if (data.experience.length > 0) {
                        yield tx.experience.createMany({
                            data: data.experience.map((exp) => (Object.assign(Object.assign({}, exp), { userId }))),
                        });
                    }
                }
                // Handle education updates if provided
                if (data.education) {
                    // Delete existing education entries
                    yield tx.education.deleteMany({
                        where: { userId },
                    });
                    // Create new education entries
                    if (data.education.length > 0) {
                        yield tx.education.createMany({
                            data: data.education.map((edu) => (Object.assign(Object.assign({}, edu), { userId }))),
                        });
                    }
                }
                // Fetch the updated user with experience and education
                return tx.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        bio: true,
                        avatar: true,
                        skills: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
                        experience: {
                            select: {
                                id: true,
                                title: true,
                                company: true,
                                location: true,
                                startDate: true,
                                endDate: true,
                                current: true,
                                description: true,
                            },
                        },
                        education: {
                            select: {
                                id: true,
                                school: true,
                                degree: true,
                                fieldOfStudy: true,
                                startDate: true,
                                endDate: true,
                                current: true,
                                description: true,
                            },
                        },
                    },
                });
            }));
            return updated;
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map