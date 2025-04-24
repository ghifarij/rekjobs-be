import { Router } from "express";
import { UserApplicationController } from "../../controller/user/userApplication.controller";
import { upload } from "../..";
import { verifyTokenUser } from "../../middleware/verify.user";

export class UserApplicationRouter {
  public router: Router;
  private userApplicationController: UserApplicationController;

  constructor() {
    this.router = Router();
    this.userApplicationController = new UserApplicationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const multiUpload = upload.fields([
      { name: "coverLetter", maxCount: 1 },
      { name: "resume", maxCount: 1 },
    ]);

    // Create a new application (job seeker)
    this.router.post(
      "/",
      verifyTokenUser,
      multiUpload,
      this.userApplicationController.createApplication
    );

    // Get all applications for the current user
    this.router.get(
      "/",
      verifyTokenUser,
      this.userApplicationController.getUserApplications
    );

    // Delete an application (job seeker)
    this.router.delete(
      "/:id",
      verifyTokenUser,
      this.userApplicationController.deleteApplication
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
