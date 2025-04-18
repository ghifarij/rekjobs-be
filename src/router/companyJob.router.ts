import { Router } from "express";
import { CompanyJobController } from "../controller/job/companyJob.controller";
import { verifyTokenCompany } from "../middleware/verify.company";

export class CompanyJobRouter {
  public router: Router;
  private companyJobController: CompanyJobController;

  constructor() {
    this.router = Router();
    this.companyJobController = new CompanyJobController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create a new job
    this.router.post(
      "/",
      verifyTokenCompany,
      this.companyJobController.createJob
    );

    // Get all jobs for the company
    this.router.get("/", verifyTokenCompany, this.companyJobController.getJobs);

    // Update a job
    this.router.put(
      "/:id",
      verifyTokenCompany,
      this.companyJobController.updateJob
    );

    // Delete a job
    this.router.delete(
      "/:id",
      verifyTokenCompany,
      this.companyJobController.deleteJob
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
