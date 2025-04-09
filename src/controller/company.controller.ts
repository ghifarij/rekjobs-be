import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";

export class CompanyController {
  public getAllCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          description: true,
          logo: true,
          location: true,
          industry: true,
          size: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCompanyById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: parseInt(req.params.id) },
        select: {
          id: true,
          name: true,
          email: true,
          description: true,
          logo: true,
          location: true,
          industry: true,
          size: true,
          jobs: {
            select: {
              id: true,
              title: true,
              location: true,
              jobType: true,
              deadline: true,
              isActive: true,
            },
          },
          createdAt: true,
        },
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: "Company not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  public createCompany = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        email,
        password,
        name,
        description,
        logo,
        location,
        industry,
        size,
      } = req.body;

      // Check if company exists
      const companyExists = await prisma.company.findUnique({
        where: { email },
      });

      if (companyExists) {
        res.status(400).json({
          success: false,
          message: "Company already exists",
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create company
      const company = await prisma.company.create({
        data: {
          email,
          password: hashedPassword,
          name,
          description,
          logo,
          location,
          industry,
          size,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: company.id,
          name: company.name,
          email: company.email,
          description: company.description,
          logo: company.logo,
          location: company.location,
          industry: company.industry,
          size: company.size,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateCompanyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, description, logo, location, industry, size } = req.body;

      const updatedCompany = await prisma.company.update({
        where: { id: req.user.id },
        data: {
          name,
          description,
          logo,
          location,
          industry,
          size,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          id: updatedCompany.id,
          name: updatedCompany.name,
          email: updatedCompany.email,
          description: updatedCompany.description,
          logo: updatedCompany.logo,
          location: updatedCompany.location,
          industry: updatedCompany.industry,
          size: updatedCompany.size,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getCompanyJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = parseInt(req.params.id);

      const jobs = await prisma.job.findMany({
        where: { companyId },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          requirements: true,
          salary: true,
          jobType: true,
          experience: true,
          deadline: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  };
}
