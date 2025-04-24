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
exports.CompanyService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = require("bcryptjs");
class CompanyService {
    constructor() {
        this.prisma = prisma_1.default;
    }
    /** Fetch only the company's own profile fields */
    getProfile(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.company.findUnique({
                where: { id: companyId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    description: true,
                    website: true,
                    logo: true,
                    location: true,
                    industry: true,
                    size: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }
    /** Update only the company's own data */
    updateProfile(companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = Object.assign({}, data);
            if (updates.password) {
                updates.password = yield (0, bcryptjs_1.hash)(updates.password, 10);
            }
            return this.prisma.company.update({
                where: { id: companyId },
                data: updates,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    description: true,
                    website: true,
                    logo: true,
                    location: true,
                    industry: true,
                    size: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }
}
exports.CompanyService = CompanyService;
//# sourceMappingURL=company.service.js.map