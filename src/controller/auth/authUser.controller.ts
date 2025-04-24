import { Request, Response, NextFunction } from "express";
import { AuthUserService } from "../../services/authUser.service";
import { RequestHandler } from "express";

export class AuthUserController {
  private authUserService: AuthUserService;

  constructor() {
    this.authUserService = new AuthUserService();
  }

  public loginUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const result = await this.authUserService.loginUser(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public registerUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      const result = await this.authUserService.registerUser(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public verifyUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token, username, password, no_handphone } = req.body;
      const result = await this.authUserService.verifyUser(token, {
        username,
        password,
        no_handphone,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public socialLogin: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Social login request body:", req.body);
      const { googleId, email, name, picture } = req.body;
      console.log("Extracted Google data:", { googleId, email, name, picture });
      const result = await this.authUserService.socialLogin(
        googleId,
        email,
        name,
        picture
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public forgotPasswordUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      const result = await this.authUserService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token, password } = req.body;
      const result = await this.authUserService.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public checkVerificationStatus: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.body;
      const result = await this.authUserService.checkVerificationStatus(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
