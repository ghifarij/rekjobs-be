import { Router } from "express";
import { AuthCompanyController } from "../../controller/auth/authCompany.controller";

export class AuthCompanyRouter {
  public router: Router;
  private authCompanyController: AuthCompanyController;

  constructor() {
    this.router = Router();
    this.authCompanyController = new AuthCompanyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Login and Register
    this.router.post("/login", this.authCompanyController.loginCompany);
    this.router.post("/register", this.authCompanyController.registerCompany);

    // Email Verification
    this.router.post("/verify", this.authCompanyController.verifyCompany);
    this.router.post(
      "/check-verification",
      this.authCompanyController.checkVerificationStatus
    );

    // Social Login
    this.router.post("/social-login", this.authCompanyController.socialLogin);

    // Password Reset
    this.router.post(
      "/forgot-password",
      this.authCompanyController.forgotPasswordCompany
    );
    this.router.post(
      "/reset-password",
      this.authCompanyController.resetPasswordCompany
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
