import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routers
import { AuthUserRouter } from "./router/auth/authUser.router";
import { AuthCompanyRouter } from "./router/auth/authCompany.router";
import { CompanyJobRouter } from "./router/job/companyJob.router";
import { SessionRouter } from "./router/auth/session.router";
import { JobRouter } from "./router/job/job.router";
import { CompanyRouter } from "./router/company/company.router";
import { UserRouter } from "./router/user/user.router";
import { UserApplicationRouter } from "./router/user/userApplication.router";
import { CompanyApplicationRouter } from "./router/company/companyApplication.router";
import { CompanyInterviewRouter } from "./router/company/companyInterview.router";
import { UserInterviewRouter } from "./router/user/userInterview.router";
// Load environment variables
dotenv.config();

const PORT: number = 8000;
const base_url_fe = process.env.NEXT_PUBLIC_BASE_URL_FE;
export const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: `${base_url_fe}`,
    credentials: true,
  })
);

// Initialize routers
const authUserRouter = new AuthUserRouter();
const authCompanyRouter = new AuthCompanyRouter();
const sessionRouter = new SessionRouter();
const companyJobRouter = new CompanyJobRouter();
const jobRouter = new JobRouter();
const companyRouter = new CompanyRouter();
const userRouter = new UserRouter();
const userApplicationRouter = new UserApplicationRouter();
const companyApplicationRouter = new CompanyApplicationRouter();
const companyInterviewRouter = new CompanyInterviewRouter();
const userInterviewRouter = new UserInterviewRouter();
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
app.get("/api", (req: Request, res: Response) => {
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

export default app;
