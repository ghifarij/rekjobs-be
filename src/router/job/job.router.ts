import { Router } from "express";
import { JobController } from "../../controller/job/job.controller";
import { verifyTokenUser } from "../../middleware/verify.user";

export class JobRouter {
  public router: Router;
  private jobController: JobController;

  constructor() {
    this.router = Router();
    this.jobController = new JobController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyTokenUser, this.jobController.getAllJobs);

    this.router.get("/:slug", verifyTokenUser, this.jobController.getJobBySlug);
  }

  public getRouter(): Router {
    return this.router;
  }
}
