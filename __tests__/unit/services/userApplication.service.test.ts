import { UserApplicationService } from '../../../src/services/userApplication.service';

jest.mock('../../../src/prisma', () => {
  const mocked = {
    job: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { __esModule: true, default: mocked };
});

jest.mock('../../../src/services/uploadService', () => ({
  __esModule: true,
  uploadApplicationFile: jest.fn(async (_f: any) => 'https://cdn/x'),
}));

describe('UserApplicationService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createApplication validates, uploads files, and creates app', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new UserApplicationService();
    mockPrisma.job.findUnique.mockResolvedValue({ id: 9 });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.application.findFirst.mockResolvedValue(null);
    const created = { id: 1, status: 'PENDING' } as any;
    mockPrisma.application.create.mockResolvedValue(created);

    const files: any = {
      coverLetterFile: { originalname: 'c.txt' },
      resumeFile: { originalname: 'r.pdf' },
    };
    const res = await svc.createApplication(1, 9, files);
    expect(mockPrisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          coverLetter: expect.stringContaining('https://'),
          resume: expect.stringContaining('https://'),
          status: 'PENDING',
          job: { connect: { id: 9 } },
          applicant: { connect: { id: 1 } },
        }),
        include: expect.any(Object),
      }),
    );
    expect(res).toBe(created);

    // Errors: job not found
    mockPrisma.job.findUnique.mockResolvedValueOnce(null);
    await expect(svc.createApplication(1, 999, {} as any)).rejects.toThrow(
      'Job not found',
    );

    // user not found
    mockPrisma.job.findUnique.mockResolvedValueOnce({ id: 2 });
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(svc.createApplication(1, 2, {} as any)).rejects.toThrow(
      'User not found',
    );

    // duplicate application
    mockPrisma.job.findUnique.mockResolvedValueOnce({ id: 2 });
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 1 });
    mockPrisma.application.findFirst.mockResolvedValueOnce({ id: 99 });
    await expect(svc.createApplication(1, 2, {} as any)).rejects.toThrow(
      'already applied',
    );
  });

  it('getUserApplications returns list with includes', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new UserApplicationService();
    const items = [{ id: 1 }];
    mockPrisma.application.findMany.mockResolvedValue(items);

    const res = await svc.getUserApplications(1);
    expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
      where: { applicantId: 1 },
      include: { job: { include: { company: true } }, interviews: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(res).toBe(items);
  });

  it('deleteApplication enforces ownership and deletes', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new UserApplicationService();

    // not found
    mockPrisma.application.findUnique.mockResolvedValueOnce(null);
    await expect(svc.deleteApplication(1, 1)).rejects.toThrow(
      'Application not found',
    );

    // forbidden
    mockPrisma.application.findUnique.mockResolvedValueOnce({
      id: 5,
      applicantId: 2,
    });
    await expect(svc.deleteApplication(5, 1)).rejects.toThrow('permission');

    // ok
    mockPrisma.application.findUnique.mockResolvedValueOnce({
      id: 5,
      applicantId: 1,
    });
    mockPrisma.application.delete.mockResolvedValueOnce({});
    await svc.deleteApplication(5, 1);
    expect(mockPrisma.application.delete).toHaveBeenCalledWith({
      where: { id: 5 },
    });
  });
});
