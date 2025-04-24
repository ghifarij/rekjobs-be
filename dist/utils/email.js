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
exports.sendCompanyVerificationEmail = exports.sendUserVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const verificationEmailTemplate = (verificationLink) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to RekJobs!</h1>
    </div>
    <div class="content">
        <h2>Verifikasi Email Diperlukan</h2>
        <p>Terima kasih telah mendaftar di RekJobs! Untuk menyelesaikan pendaftaran Anda dan mengakses semua fitur, silakan verifikasi alamat email Anda.</p>
        <p>Langkah ini memastikan keamanan akun Anda dan membantu kami menjaga komunitas yang dipercayai antara pencari kerja dan pemberi kerja.</p>
        <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verifikasi Email Anda</a>
        </div>
        <p>Link verifikasi ini akan kedaluwarsa dalam 1 jam untuk alasan keamanan.</p>
    </div>
    <div class="footer">
        <p>Jika Anda tidak membuat akun di RekJobs, silakan abaikan email ini.</p>
        <p>© 2024 RekJobs. Semua hak dilindungi.</p>
    </div>
</body>
</html>
`;
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, text, html }) {
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
});
exports.sendEmail = sendEmail;
const sendUserVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/user/verify-user/${token}`;
    yield (0, exports.sendEmail)({
        to,
        subject: "Verifikasi Akun RekJobs",
        html: verificationEmailTemplate(verificationLink),
    });
});
exports.sendUserVerificationEmail = sendUserVerificationEmail;
const sendCompanyVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/company/verify-company/${token}`;
    yield (0, exports.sendEmail)({
        to,
        subject: "Verifikasi Akun RekJobs",
        html: verificationEmailTemplate(verificationLink),
    });
});
exports.sendCompanyVerificationEmail = sendCompanyVerificationEmail;
//# sourceMappingURL=email.js.map