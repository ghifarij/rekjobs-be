import { Router } from "express";
import { verifyTokenCompany } from "../../middleware/verify.company";
import { CompanyInterviewController } from "../../controller/company/companyInterview.controller";

export class CompanyInterviewRouter {
  public router: Router;
  private companyInterviewController: CompanyInterviewController;

  constructor() {
    this.router = Router();
    this.companyInterviewController = new CompanyInterviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      verifyTokenCompany,
      this.companyInterviewController.createInterview
    );

    this.router.get(
      "/",
      verifyTokenCompany,
      this.companyInterviewController.getCompanyInterviews
    );

    this.router.patch(
      "/:id",
      verifyTokenCompany,
      this.companyInterviewController.reschedule
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
