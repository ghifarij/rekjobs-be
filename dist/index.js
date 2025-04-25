"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routers
const authUser_router_1 = require("./router/auth/authUser.router");
const authCompany_router_1 = require("./router/auth/authCompany.router");
const companyJob_router_1 = require("./router/job/companyJob.router");
const session_router_1 = require("./router/auth/session.router");
const job_router_1 = require("./router/job/job.router");
const company_router_1 = require("./router/company/company.router");
const user_router_1 = require("./router/user/user.router");
const userApplication_router_1 = require("./router/user/userApplication.router");
const companyApplication_router_1 = require("./router/company/companyApplication.router");
const companyInterview_router_1 = require("./router/company/companyInterview.router");
const userInterview_router_1 = require("./router/user/userInterview.router");
// Load environment variables
dotenv_1.default.config();
const PORT = 8000;
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "2mb" }));
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    "http://localhost:3000",
    "https://rekjobs-fe.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (incomingOrigin, cb) => {
        if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
        }
    },
    credentials: true,
}));
// Initialize routers
const authUserRouter = new authUser_router_1.AuthUserRouter();
const authCompanyRouter = new authCompany_router_1.AuthCompanyRouter();
const sessionRouter = new session_router_1.SessionRouter();
const companyJobRouter = new companyJob_router_1.CompanyJobRouter();
const jobRouter = new job_router_1.JobRouter();
const companyRouter = new company_router_1.CompanyRouter();
const userRouter = new user_router_1.UserRouter();
const userApplicationRouter = new userApplication_router_1.UserApplicationRouter();
const companyApplicationRouter = new companyApplication_router_1.CompanyApplicationRouter();
const companyInterviewRouter = new companyInterview_router_1.CompanyInterviewRouter();
const userInterviewRouter = new userInterview_router_1.UserInterviewRouter();
// Routes
app.use("/api/auth/user", authUserRouter.getRouter());
app.use("/api/auth/company", authCompanyRouter.getRouter());
app.use("/api/auth/session", sessionRouter.getRouter());
app.use("/api/company-jobs", companyJobRouter.getRouter());
app.use("/api/jobs", jobRouter.getRouter());
app.use("/api/company-profile", companyRouter.getRouter());
app.use("/api/user-profile", userRouter.getRouter());
app.use("/api/applications/user", userApplicationRouter.getRouter());
app.use("/api/applications/company", companyApplicationRouter.getRouter());
app.use("/api/interviews/company", companyInterviewRouter.getRouter());
app.use("/api/interviews/user", userInterviewRouter.getRouter());
// Health check route
app.get("/api", (req, res) => {
    res.status(200).json({ status: "ok", message: "Welcome to RekJobs API" });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on -> http://localhost:${PORT}/api`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map