import express from "express";
import { UserController } from "../controller/user.controller";

export class UserRouter {
  private router: express.Router;
  private userController: UserController;

  constructor() {
    this.router = express.Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Protected routes
    this.router.get(
      "/me",
      this.userController.getProfile.bind(this.userController)
    );
    this.router.put(
      "/me",
      this.userController.updateProfile.bind(this.userController)
    );
    this.router.put(
      "/me/resume",
      this.userController.updateResume.bind(this.userController)
    );
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
