import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routers
import { AuthRouter } from "./router/auth.router";
import { UserRouter } from "./router/user.router";
import { CompanyRouter } from "./router/company.router";
import { JobRouter } from "./router/job.router";
import { ApplicationRouter } from "./router/application.router";
import InterviewRouter from "./router/interview.router";

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
const authRouter = new AuthRouter();
const userRouter = new UserRouter();
const companyRouter = new CompanyRouter();
const jobRouter = new JobRouter();
const applicationRouter = new ApplicationRouter();
const interviewRouter = new InterviewRouter();

// Routes
app.use("/api/auth", authRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/companies", companyRouter.getRouter());
app.use("/api/jobs", jobRouter.getRouter());
app.use("/api/applications", applicationRouter.getRouter());
app.use("/api/interviews", interviewRouter.getRouter());

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
