import { CompanyService } from '../../../src/services/company.service';

// Mock prisma singleton used by CompanyService
jest.mock('../../../src/prisma', () => {
  const mocked = {
    company: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { __esModule: true, default: mocked };
});

jest.mock('bcryptjs', () => ({
  __esModule: true,
  hash: jest.fn(async (pw: string) => `hashed_${pw}`),
}));

describe('CompanyService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getProfile returns selected fields', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new CompanyService();
    const company = {
      id: 1,
      name: 'Acme',
      email: 'a@c.com',
      description: null,
      website: null,
      logo: null,
      location: null,
      industry: null,
      size: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.company.findUnique.mockResolvedValue(company);

    const result = await svc.getProfile(1);

    expect(mockPrisma.company.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
    expect(result).toEqual(company);
  });

  it('updateProfile hashes password and updates company', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const svc = new CompanyService();
    const updated = {
      id: 1,
      name: 'Acme',
      email: 'a@c.com',
      description: 'd',
      website: 'w',
      logo: 'l',
      location: 'loc',
      industry: 'ind',
      size: 'SMALL',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    mockPrisma.company.update.mockResolvedValue(updated);

    const res = await svc.updateProfile(1, {
      name: 'Acme',
      password: 'new',
    } as any);

    expect(mockPrisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          name: 'Acme',
          password: expect.stringMatching(/^hashed_/),
        }),
      }),
    );
    expect(res).toBe(updated);
  });
});
