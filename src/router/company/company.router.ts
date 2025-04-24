import { Router } from "express";
import { CompanyController } from "../../controller/company/company.controller";
import { verifyTokenCompany } from "../../middleware/verify.company";

export class CompanyRouter {
  public router: Router;
  private companyController: CompanyController;

  constructor() {
    this.router = Router();
    this.companyController = new CompanyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyTokenCompany, this.companyController.getProfile);
    this.router.put(
      "/",
      verifyTokenCompany,
      this.companyController.updateProfile
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
