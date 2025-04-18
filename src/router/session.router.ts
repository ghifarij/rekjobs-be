import { Router } from "express";
import { SessionController } from "../controller/auth/session.controller";

export class SessionRouter {
  public router: Router;
  private sessionController: SessionController;

  constructor() {
    this.router = Router();
    this.sessionController = new SessionController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.sessionController.getSession);
  }

  public getRouter(): Router {
    return this.router;
  }
}
