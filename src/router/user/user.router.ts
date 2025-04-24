import { Router } from "express";
import { UserController } from "../../controller/user/user.controller";
import { verifyTokenUser } from "../../middleware/verify.user";

export class UserRouter {
  public router: Router;
  private UserController: UserController;

  constructor() {
    this.router = Router();
    this.UserController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyTokenUser, this.UserController.getProfile);
    this.router.put("/", verifyTokenUser, this.UserController.updateProfile);
  }

  public getRouter(): Router {
    return this.router;
  }
}
