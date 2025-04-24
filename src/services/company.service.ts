// src/services/company.service.ts
import { CompanySize, PrismaClient } from "../../prisma/generated/client";
import prisma from "../prisma";
import { hash } from "bcryptjs";

export class CompanyService {
  private prisma = prisma as PrismaClient;

  /** Fetch only the company's own profile fields */
  public async getProfile(companyId: number): Promise<{
    id: number;
    name: string;
    email: string;
    description: string | null;
    website: string | null;
    logo: string | null;
    location: string | null;
    industry: string | null;
    size: string | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.company.findUnique({
      where: { id: companyId },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /** Update only the company's own data */
  public async updateProfile(
    companyId: number,
    data: {
      name?: string;
      description?: string;
      website?: string;
      logo?: string;
      location?: string;
      industry?: string;
      size?: CompanySize;
      password?: string;
    }
  ) {
    const updates: typeof data = { ...data };
    if (updates.password) {
      updates.password = await hash(updates.password, 10);
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: updates,
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
