// src/controllers/company.controller.ts
import { Request, Response, NextFunction } from "express";
import { CompanyService } from "../../services/company.service";
import { RequestHandler } from "express";

// Define CompanySize type
type CompanySize = "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  // Fetch the company's own profile
  public getProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const profile = await this.companyService.getProfile(companyId);
      if (!profile) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  // Update the company's own profile
  public updateProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      const updateData: {
        name?: string;
        description?: string;
        website?: string;
        logo?: string;
        location?: string;
        industry?: string;
        size?: CompanySize;
        password?: string;
      } = {
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        logo: req.body.logo,
        location: req.body.location,
        industry: req.body.industry,
        size: req.body.size as CompanySize,
      };

      if (req.body.password) {
        updateData.password = req.body.password;
      }

      const updatedProfile = await this.companyService.updateProfile(
        companyId,
        updateData
      );

      res.status(200).json(updatedProfile);
    } catch (error) {
      next(error);
    }
  };
}
