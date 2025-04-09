import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        res.status(400).json({
          success: false,
          message: "User already exists",
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // Create token
      const token = jwt.sign(
        { id: user.id, type: "user" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async registerCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        email,
        password,
        name,
        description,
        website,
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
          website,
          logo,
          location,
          industry,
          size,
        },
      });

      // Create token
      const token = jwt.sign(
        { id: company.id, type: "company" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      res.status(201).json({
        success: true,
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Create token
      const token = jwt.sign(
        { id: user.id, type: "user" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async loginCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { email },
      });

      if (!company) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, company.password);

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Create token
      const token = jwt.sign(
        { id: company.id, type: "company" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      res.status(200).json({
        success: true,
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bio: true,
          avatar: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          description: true,
          website: true,
          logo: true,
          location: true,
          industry: true,
          size: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }
}
