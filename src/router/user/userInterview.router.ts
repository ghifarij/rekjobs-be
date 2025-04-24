import { Router } from "express";
import { UserInterviewController } from "../../controller/user/userInterview.controller";
import { verifyTokenUser } from "../../middleware/verify.user";

export class UserInterviewRouter {
  public router: Router;
  private userInterviewController: UserInterviewController;

  constructor() {
    this.router = Router();
    this.userInterviewController = new UserInterviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      "/:id/reschedule",
      verifyTokenUser,
      this.userInterviewController.requestReschedule
    );

    this.router.patch(
      "/:id/accept",
      verifyTokenUser,
      this.userInterviewController.acceptInterview
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
