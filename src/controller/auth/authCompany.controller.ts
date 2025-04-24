import { Request, Response, NextFunction } from "express";
import { AuthCompanyService } from "../../services/authCompany.service";
import { RequestHandler } from "express";

export class AuthCompanyController {
  private authCompanyService: AuthCompanyService;

  constructor() {
    this.authCompanyService = new AuthCompanyService();
  }

  public loginCompany: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const result = await this.authCompanyService.loginCompany(
        email,
        password
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public registerCompany: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      const result = await this.authCompanyService.registerCompany(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public verifyCompany: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        token,
        name,
        password,
        description,
        website,
        location,
        industry,
        size,
      } = req.body;
      const result = await this.authCompanyService.verifyCompany(token, {
        name,
        password,
        description,
        website,
        location,
        industry,
        size,
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
      const result = await this.authCompanyService.socialLogin(
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

  public forgotPasswordCompany: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      const result = await this.authCompanyService.forgotPasswordCompany(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordCompany: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token, password } = req.body;
      const result = await this.authCompanyService.resetPasswordCompany(
        token,
        password
      );
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
      const result = await this.authCompanyService.checkVerificationStatus(
        token
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
