// Mock PrismaClient from the generated client used in the service
const mockPrisma: any = {
  job: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../../../prisma/generated/client', () => {
  return {
    __esModule: true,
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
    // Provide a minimal JobType enum shape if referenced by tests
    JobType: { FULL_TIME: 'FULL_TIME', PART_TIME: 'PART_TIME' },
    Prisma: {},
  } as any;
});

import { JobService } from '../../../src/services/job.service';

describe('JobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createJob generates a unique slug and creates the job', async () => {
    const svc = new JobService();
    mockPrisma.job.create.mockResolvedValue({
      id: 1,
      slug: 'software-engineer-abcdef',
    });

    const jobData: any = {
      title: 'Software Engineer',
      description: 'desc',
      location: 'Remote',
      requirements: 'reqs',
      jobType: 'FULL_TIME',
      deadline: new Date(),
    };

    const result = await svc.createJob(10, jobData);

    expect(mockPrisma.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 10,
          title: 'Software Engineer',
          slug: expect.stringMatching(/^software-engineer-[a-z0-9]{6}$/),
        }),
      }),
    );
    expect(result).toEqual({ id: 1, slug: 'software-engineer-abcdef' });
  });

  it('updateJob updates job with provided data and company scope', async () => {
    const svc = new JobService();
    mockPrisma.job.update.mockResolvedValue({ id: 2, title: 'Updated' });

    const updated = await svc.updateJob(2, 33, { title: 'Updated' } as any);

    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: 2, companyId: 33 },
      data: { title: 'Updated' },
    });
    expect(updated).toEqual({ id: 2, title: 'Updated' });
  });

  it('deleteJob deletes by id and companyId', async () => {
    const svc = new JobService();
    mockPrisma.job.delete.mockResolvedValue({});

    await svc.deleteJob(5, 44);

    expect(mockPrisma.job.delete).toHaveBeenCalledWith({
      where: { id: 5, companyId: 44 },
    });
  });

  it('getCompanyJobs returns jobs ordered by createdAt desc with applications', async () => {
    const svc = new JobService();
    const jobs = [{ id: 1 }, { id: 2 }];
    mockPrisma.job.findMany.mockResolvedValue(jobs);

    const result = await svc.getCompanyJobs(99);

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: { companyId: 99 },
      include: { applications: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(jobs);
  });

  it('getAllJobs builds query without search', async () => {
    const svc = new JobService();
    const jobs = [] as any;
    mockPrisma.job.findMany.mockResolvedValue(jobs);

    const result = await svc.getAllJobs();

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        company: { select: { id: true, name: true, logo: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(jobs);
  });

  it('getAllJobs builds query with search', async () => {
    const svc = new JobService();
    const jobs = [] as any;
    mockPrisma.job.findMany.mockResolvedValue(jobs);

    const result = await svc.getAllJobs('dev');

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        OR: [
          { title: { contains: 'dev', mode: 'insensitive' } },
          { location: { contains: 'dev', mode: 'insensitive' } },
          { description: { contains: 'dev', mode: 'insensitive' } },
        ],
      },
      include: {
        company: { select: { id: true, name: true, logo: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(jobs);
  });

  it('getJobBySlug includes company and applications', async () => {
    const svc = new JobService();
    const job = { id: 1, slug: 'abc' } as any;
    mockPrisma.job.findUnique.mockResolvedValue(job);

    const result = await svc.getJobBySlug('abc');

    expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
      where: { slug: 'abc' },
      include: {
        company: { select: { id: true, name: true, logo: true, email: true } },
        applications: { select: { id: true, status: true } },
      },
    });
    expect(result).toBe(job);
  });

  it('getJobById returns job only if company matches', async () => {
    const svc = new JobService();

    // matching company
    mockPrisma.job.findUnique.mockResolvedValueOnce({
      id: 1,
      companyId: 5,
    } as any);
    const ok = await svc.getJobById(1, 5);
    expect(ok).toEqual({ id: 1, companyId: 5 });

    // mismatched company -> null
    mockPrisma.job.findUnique.mockResolvedValueOnce({
      id: 2,
      companyId: 8,
    } as any);
    const notOk = await svc.getJobById(2, 9);
    expect(notOk).toBeNull();
  });
});
