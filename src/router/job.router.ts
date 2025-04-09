import { RequestHandler, Router } from "express";
import { JobController } from "../controller/job.controller";

export class JobRouter {
  private router: Router;
  private jobController: JobController;

  constructor() {
    this.router = Router();
    this.jobController = new JobController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.get(
      "/",
      this.jobController.getAllJobs as unknown as RequestHandler
    );
    this.router.get(
      "/search",
      this.jobController.searchJobs as unknown as RequestHandler
    );
    this.router.get(
      "/:id",
      this.jobController.getJobById as unknown as RequestHandler
    );

    // Protected routes (company only)
    this.router.post(
      "/",
      this.jobController.createJob as unknown as RequestHandler
    );
    this.router.put(
      "/:id",
      this.jobController.updateJob as unknown as RequestHandler
    );
    this.router.delete(
      "/:id",
      this.jobController.deleteJob as unknown as RequestHandler
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
