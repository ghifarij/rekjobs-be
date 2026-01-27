import { CompanyInterviewService } from '../../../src/services/companyInterview.service';

jest.mock('../../../src/prisma', () => {
  const mocked = {
    application: { findUnique: jest.fn() },
    interview: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { __esModule: true, default: mocked };
});

describe('CompanyInterviewService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createInterview checks application and creates interview', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new CompanyInterviewService();
    mockPrisma.application.findUnique.mockResolvedValue({ id: 11 });
    const created = { id: 1, status: 'SCHEDULED' } as any;
    mockPrisma.interview.create.mockResolvedValue(created);

    const res = await svc.createInterview(11, new Date('2025-01-01'), 'note');
    expect(mockPrisma.interview.create).toHaveBeenCalled();
    expect(res).toBe(created);

    mockPrisma.application.findUnique.mockResolvedValueOnce(null);
    await expect(
      svc.createInterview(999, new Date(), undefined),
    ).rejects.toThrow('Application not found');
  });

  it('getCompanyInterviews queries by companyId with includes', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new CompanyInterviewService();
    const items = [{ id: 1 }];
    mockPrisma.interview.findMany.mockResolvedValue(items);

    const res = await svc.getCompanyInterviews(77);
    expect(mockPrisma.interview.findMany).toHaveBeenCalledWith({
      where: { application: { job: { companyId: 77 } } },
      include: {
        application: {
          select: {
            job: { select: { id: true, title: true, slug: true } },
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    expect(res).toBe(items);
  });

  it('rescheduleInterview enforces ownership and updates', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new CompanyInterviewService();

    // not found
    mockPrisma.interview.findUnique.mockResolvedValueOnce(null);
    await expect(svc.rescheduleInterview(1, 2, new Date())).rejects.toThrow(
      'Interview not found',
    );

    // forbidden
    mockPrisma.interview.findUnique.mockResolvedValueOnce({
      id: 1,
      application: { job: { companyId: 10 } },
    });
    await expect(svc.rescheduleInterview(1, 2, new Date())).rejects.toThrow(
      'Forbidden',
    );

    // ok
    mockPrisma.interview.findUnique.mockResolvedValueOnce({
      id: 1,
      application: { job: { companyId: 2 } },
    });
    const updated = { id: 1, status: 'RESCHEDULED' } as any;
    mockPrisma.interview.update.mockResolvedValueOnce(updated);
    const r = await svc.rescheduleInterview(1, 2, new Date('2025-02-02'), 'n');
    expect(mockPrisma.interview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'RESCHEDULED', notes: 'n' }),
      }),
    );
    expect(r).toBe(updated);
  });
});
