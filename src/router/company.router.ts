import express from "express";
import { CompanyController } from "../controller/company.controller";

export class CompanyRouter {
  private router: express.Router;
  private companyController: CompanyController;

  constructor() {
    this.router = express.Router();
    this.companyController = new CompanyController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get all companies
    this.router.get(
      "/",
      this.companyController.getAllCompanies.bind(this.companyController)
    );

    // Get company by ID
    this.router.get(
      "/:id",
      this.companyController.getCompanyById.bind(this.companyController)
    );

    // Create company profile
    this.router.post(
      "/",
      this.companyController.createCompany.bind(this.companyController)
    );

    // Update company profile
    this.router.put(
      "/profile",
      this.companyController.updateCompanyProfile.bind(this.companyController)
    );

    // Get company jobs
    this.router.get(
      "/:id/jobs",
      this.companyController.getCompanyJobs.bind(this.companyController)
    );
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
