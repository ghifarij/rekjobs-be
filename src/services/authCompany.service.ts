import { CompanySize, PrismaClient } from "../../prisma/generated/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail, sendCompanyVerificationEmail } from "../utils/email";

export class AuthCompanyService {
  private prisma: PrismaClient;
  private googleClient: OAuth2Client;

  constructor() {
    this.prisma = new PrismaClient();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public async loginCompany(email: string, password: string) {
    const company = await this.prisma.company.findUnique({ where: { email } });
    if (!company) {
      throw new Error("Company not found");
    }

    const isValidPassword = await bcrypt.compare(password, company.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { id: company.id, type: "company" },
      process.env.JWT_KEY!,
      {
        expiresIn: "1d",
      }
    );

    return {
      token,
      company: {
        id: company.id,
        email: company.email,
        name: company.name,
        logo: company.logo,
      },
    };
  }

  public async registerCompany(email: string) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { email },
    });
    if (existingCompany) {
      throw new Error("Email already registered");
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_KEY!, {
      expiresIn: "1h",
    });

    // Create company with verification token and default values
    await this.prisma.company.create({
      data: {
        email,
        name: "", // Will be set during verification
        password: "", // Will be set during verification
        verificationToken,
        isVerified: false,
      },
    });

    await sendCompanyVerificationEmail(email, verificationToken);

    return {
      message: "Verification email sent",
    };
  }

  public async verifyCompany(
    token: string,
    companyData: {
      name: string;
      password: string;
      description?: string;
      website?: string;
      location?: string;
      industry?: string;
      size?: CompanySize;
    }
  ) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      email: string;
    };
    const company = await this.prisma.company.findFirst({
      where: {
        email: decoded.email,
        verificationToken: token,
        isVerified: false,
      },
    });

    if (!company) {
      throw new Error("Invalid or expired verification token");
    }

    const hashedPassword = await bcrypt.hash(companyData.password, 10);

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        isVerified: true,
        name: companyData.name,
        password: hashedPassword,
        description: companyData.description || null,
        website: companyData.website || null,
        location: companyData.location || null,
        industry: companyData.industry || null,
        size: companyData.size || null,
        verificationToken: null, // Clear the verification token after successful verification
      },
    });

    return {
      message: "Account verified successfully",
    };
  }

  public async socialLogin(
    googleId: string,
    email?: string,
    name?: string,
    picture?: string
  ) {
    try {
      if (!googleId) {
        throw new Error("Google ID is required");
      }

      console.log("Processing social login for Google ID:", googleId);

      // First check if company exists with this email
      const existingCompany = await this.prisma.company.findFirst({
        where: { email },
      });

      if (existingCompany) {
        if (!existingCompany.googleId) {
          throw new Error(
            "Email already registered with password. Please use email login instead."
          );
        }
        if (existingCompany.googleId !== String(googleId)) {
          throw new Error(
            "This email is already registered with a different Google account."
          );
        }
      }

      // Find company by Google ID
      let company = await this.prisma.company.findFirst({
        where: { googleId },
      });

      if (!company) {
        if (!email) {
          throw new Error("Email is required for new company registration");
        }

        console.log("Company not found with Google ID, creating new company");

        // Create new company with Google ID and provided info
        company = await this.prisma.company.create({
          data: {
            email: email,
            name: name || `Google Company ${googleId.substring(0, 8)}`,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            isVerified: true,
            googleId: String(googleId),
            logo: picture || null,
          },
        });

        console.log("Created new company:", company);
      } else {
        console.log("Found existing company:", company);

        // Update company info if provided
        if (email || name || picture) {
          company = await this.prisma.company.update({
            where: { id: company.id },
            data: {
              ...(email && { email }),
              ...(name && { name }),
              ...(picture && { logo: picture }),
            },
          });
          console.log("Updated company info:", company);
        }
      }

      // Using id instead of userId for consistency
      const jwtToken = jwt.sign(
        { id: company.id, type: "company" },
        process.env.JWT_KEY!,
        {
          expiresIn: "1d",
        }
      );

      return {
        token: jwtToken,
        company: {
          id: company.id,
          email: company.email,
          name: company.name,
          logo: company.logo,
        },
        message: "Login successful",
      };
    } catch (error) {
      console.error("Social login error:", error);
      throw error;
    }
  }

  public async forgotPasswordCompany(email: string) {
    const company = await this.prisma.company.findUnique({ where: { email } });
    if (!company) {
      throw new Error("Company not found");
    }

    const resetToken = jwt.sign({ id: company.id }, process.env.JWT_KEY!, {
      expiresIn: "1h",
    });

    await sendEmail({
      to: email,
      subject: "Reset your password",
      text: `Click here to reset your password: ${process.env.FRONTEND_URL}/company/reset-password?token=${resetToken}`,
    });

    return {
      message: "Password reset email sent",
    };
  }

  public async resetPasswordCompany(token: string, password: string) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      id: number;
    };
    const company = await this.prisma.company.findUnique({
      where: { id: decoded.id },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.company.update({
      where: { id: company.id },
      data: { password: hashedPassword },
    });

    return {
      message: "Password reset successfully",
    };
  }

  public async checkVerificationStatus(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      email: string;
    };
    const company = await this.prisma.company.findUnique({
      where: { email: decoded.email },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    return {
      isVerified: company.isVerified,
      email: company.email,
    };
  }
}
