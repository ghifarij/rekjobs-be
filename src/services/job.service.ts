import { PrismaClient, Job, JobType } from "../../prisma/generated/client";
import slugify from "slugify";

const prisma = new PrismaClient();

export class JobService {
  public async createJob(
    companyId: number,
    jobData: {
      title: string;
      description: string;
      location: string;
      requirements: string;
      salary?: string;
      jobType: JobType;
      experience?: string;
      deadline: Date;
    }
  ): Promise<Job> {
    try {
      // Generate a base slug from the title
      const baseSlug = slugify(jobData.title, { lower: true, strict: true });
      // Append a random 6-character alphanumeric string to ensure uniqueness
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fullSlug = `${baseSlug}-${randomSuffix}`;

      const job = await prisma.job.create({
        data: {
          ...jobData,
          companyId,
          slug: fullSlug,
        },
      });
      return job;
    } catch (error) {
      throw error;
    }
  }

  public async updateJob(
    jobId: number,
    companyId: number,
    jobData: {
      title?: string;
      description?: string;
      location?: string;
      requirements?: string;
      salary?: string;
      jobType?: JobType;
      experience?: string;
      deadline?: Date;
      isActive?: boolean;
    }
  ): Promise<Job> {
    try {
      const job = await prisma.job.update({
        where: {
          id: jobId,
          companyId,
        },
        data: jobData,
      });
      return job;
    } catch (error) {
      throw error;
    }
  }

  public async deleteJob(jobId: number, companyId: number): Promise<void> {
    try {
      await prisma.job.delete({
        where: {
          id: jobId,
          companyId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  public async getCompanyJobs(companyId: number): Promise<Job[]> {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          companyId, // Fetch jobs only for the specified company
        },
        include: {
          applications: true, // Include applications in the response
        },
        orderBy: {
          createdAt: "desc", // Optional: Order by creation date
        },
      });
      return jobs;
    } catch (error) {
      throw error;
    }
  }

  public async getAllJobs(): Promise<Job[]> {
    try {
      // Fetch jobs that are active and include minimal company details (if needed)
      const jobs = await prisma.job.findMany({
        where: {
          isActive: true,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return jobs;
    } catch (error) {
      throw error;
    }
  }

  // Get a detailed view of a single job for the user/applicant
  public async getJobBySlug(slug: string): Promise<Job | null> {
    try {
      const job = await prisma.job.findUnique({
        where: { slug },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              email: true,
            },
          },
          applications: {
            // Optionally include applications if needed for a detailed view
            select: { id: true, status: true },
          },
        },
      });
      return job;
    } catch (error) {
      throw error;
    }
  }
}
