import { Router, RequestHandler } from "express";
import { ApplicationController } from "../controller/application.controller";

export class ApplicationRouter {
  private router: Router;
  private applicationController: ApplicationController;

  constructor() {
    this.router = Router();
    this.applicationController = new ApplicationController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Company routes
    this.router.get(
      "/company",
      this.applicationController
        .getCompanyApplications as unknown as RequestHandler
    );

    // Job seeker routes
    this.router.get(
      "/me",
      this.applicationController
        .getUserApplications as unknown as RequestHandler
    );
    this.router.get(
      "/:id",
      this.applicationController.getApplicationById as unknown as RequestHandler
    );
    this.router.post(
      "/",
      this.applicationController.createApplication as unknown as RequestHandler
    );
    this.router.patch(
      "/:id/status",
      this.applicationController
        .updateApplicationStatus as unknown as RequestHandler
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default ApplicationRouter;
