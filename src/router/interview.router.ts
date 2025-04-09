import express from "express";
import { InterviewController } from "../controller/interview.controller";

export class InterviewRouter {
  private router: express.Router;
  private interviewController: InterviewController;

  constructor() {
    this.router = express.Router();
    this.interviewController = new InterviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/",
      this.interviewController.scheduleInterview.bind(this.interviewController)
    );
    this.router.patch(
      "/:id/status",
      this.interviewController.updateInterviewStatus.bind(
        this.interviewController
      )
    );
    this.router.get(
      "/:id",
      this.interviewController.getInterviewById.bind(this.interviewController)
    );
    this.router.get(
      "/company",
      this.interviewController.getCompanyInterviews.bind(
        this.interviewController
      )
    );
    this.router.get(
      "/user",
      this.interviewController.getUserInterviews.bind(this.interviewController)
    );
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export default InterviewRouter;
