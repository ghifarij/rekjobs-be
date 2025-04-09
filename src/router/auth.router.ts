import express from "express";
import { AuthController } from "../controller/auth.controller";

export class AuthRouter {
  private router: express.Router;
  private authController: AuthController;

  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Register user
    this.router.post(
      "/register",
      this.authController.register.bind(this.authController)
    );

    // Login user
    this.router.post(
      "/login",
      this.authController.login.bind(this.authController)
    );

    // Get current user
    this.router.get(
      "/me",
      this.authController.getCurrentUser.bind(this.authController)
    );
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
