// src/services/user.service.ts
import { PrismaClient } from "../../prisma/generated/client";
import prisma from "../prisma";
import { hash } from "bcryptjs";

export class UserService {
  private prisma = prisma as PrismaClient;

  /**
   * Fetch only the authenticated user's own profile fields
   */
  public async getProfile(userId: number): Promise<{
    id: number;
    email: string;
    name: string;
    phone: string | null;
    bio: string | null;
    avatar: string | null;
    skills: string[];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    experience: {
      id: number;
      title: string;
      company: string;
      location: string | null;
      startDate: Date;
      endDate: Date | null;
      current: boolean;
      description: string | null;
    }[];
    education: {
      id: number;
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate: Date | null;
      current: boolean;
      description: string | null;
    }[];
  } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        bio: true,
        avatar: true,
        skills: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        experience: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            startDate: true,
            endDate: true,
            current: true,
            description: true,
          },
        },
        education: {
          select: {
            id: true,
            school: true,
            degree: true,
            fieldOfStudy: true,
            startDate: true,
            endDate: true,
            current: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Update only the authenticated user's own profile data
   */
  public async updateProfile(
    userId: number,
    data: {
      name?: string;
      phone?: string;
      bio?: string;
      avatar?: string;
      skills?: string[];
      password?: string;
      experience?: {
        id?: number;
        title: string;
        company: string;
        location?: string;
        startDate: Date;
        endDate?: Date;
        current: boolean;
        description?: string;
      }[];
      education?: {
        id?: number;
        school: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate?: Date;
        current: boolean;
        description?: string;
      }[];
    }
  ): Promise<{
    id: number;
    email: string;
    name: string;
    phone: string | null;
    bio: string | null;
    avatar: string | null;
    skills: string[];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    experience: {
      id: number;
      title: string;
      company: string;
      location: string | null;
      startDate: Date;
      endDate: Date | null;
      current: boolean;
      description: string | null;
    }[];
    education: {
      id: number;
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate: Date | null;
      current: boolean;
      description: string | null;
    }[];
  }> {
    // clone the update payload
    const updates: any = { ...data };
    delete updates.experience;
    delete updates.education;

    // if a new password is provided, hash it
    if (updates.password) {
      updates.password = await hash(updates.password, 10);
    }

    // Start a transaction to update user profile and related data
    const updated = await this.prisma.$transaction(async (tx) => {
      // Update user profile
      const user = await tx.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          bio: true,
          avatar: true,
          skills: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Handle experience updates if provided
      if (data.experience) {
        // Delete existing experience entries
        await tx.experience.deleteMany({
          where: { userId },
        });

        // Create new experience entries
        if (data.experience.length > 0) {
          await tx.experience.createMany({
            data: data.experience.map((exp) => ({
              ...exp,
              userId,
            })),
          });
        }
      }

      // Handle education updates if provided
      if (data.education) {
        // Delete existing education entries
        await tx.education.deleteMany({
          where: { userId },
        });

        // Create new education entries
        if (data.education.length > 0) {
          await tx.education.createMany({
            data: data.education.map((edu) => ({
              ...edu,
              userId,
            })),
          });
        }
      }

      // Fetch the updated user with experience and education
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          bio: true,
          avatar: true,
          skills: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          experience: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              startDate: true,
              endDate: true,
              current: true,
              description: true,
            },
          },
          education: {
            select: {
              id: true,
              school: true,
              degree: true,
              fieldOfStudy: true,
              startDate: true,
              endDate: true,
              current: true,
              description: true,
            },
          },
        },
      });
    });

    return updated as any;
  }
}
