import { Router } from "express";
import { AuthUserController } from "../../controller/auth/authUser.controller";

export class AuthUserRouter {
  public router: Router;
  private authUserController: AuthUserController;

  constructor() {
    this.router = Router();
    this.authUserController = new AuthUserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Login and Register
    this.router.post("/login", this.authUserController.loginUser);
    this.router.post("/register", this.authUserController.registerUser);

    // Email Verification
    this.router.post("/verify", this.authUserController.verifyUser);
    this.router.post(
      "/check-verification",
      this.authUserController.checkVerificationStatus
    );

    // Social Login
    this.router.post("/social-login", this.authUserController.socialLogin);

    // Password Reset
    this.router.post(
      "/forgot-password",
      this.authUserController.forgotPasswordUser
    );
    this.router.post(
      "/reset-password",
      this.authUserController.resetPasswordUser
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
