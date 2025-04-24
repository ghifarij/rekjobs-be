"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleClient = exports.base_url_fe = void 0;
exports.generateToken = generateToken;
const jsonwebtoken_1 = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const ms_1 = __importDefault(require("ms"));
exports.base_url_fe = process.env.NEXT_PUBLIC_BASE_URL_FE;
exports.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
function generateToken(payload, expiresIn = "1d") {
    const msValue = (0, ms_1.default)(expiresIn);
    const options = { expiresIn: msValue / 1000 };
    return (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, options);
}
//# sourceMappingURL=authHelpers.js.map