import { Router } from "express";
import { CompanyApplicationController } from "../../controller/company/companyApplication.controller";
import { verifyTokenCompany } from "../../middleware/verify.company";

export class CompanyApplicationRouter {
  public router: Router;
  private companyApplicationController: CompanyApplicationController;

  constructor() {
    this.router = Router();
    this.companyApplicationController = new CompanyApplicationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all applications for a specific job (company)
    this.router.get(
      "/",
      verifyTokenCompany,
      this.companyApplicationController.getCompanyApplications
    );

    // Get a single application by ID (user or company)
    this.router.get(
      "/:id",
      verifyTokenCompany,
      this.companyApplicationController.getApplicationById
    );

    // Update application status (company)
    this.router.patch(
      "/:id/status",
      verifyTokenCompany,
      this.companyApplicationController.updateApplicationStatus
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
