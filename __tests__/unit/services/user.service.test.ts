import { UserService } from '../../../src/services/user.service';

// Provide a mocked prisma singleton module without referencing outer variables (avoid hoist issues)
jest.mock('../../../src/prisma', () => {
  const mocked = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    experience: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    education: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { __esModule: true, default: mocked };
});

jest.mock('bcryptjs', () => ({
  __esModule: true,
  hash: jest.fn(async () => 'hashed-password'),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProfile returns selected user fields', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const service = new UserService();
    const userId = 42;
    const fakeUser = {
      id: 42,
      email: 'u@example.com',
      name: 'U',
      phone: null,
      bio: null,
      avatar: null,
      skills: [],
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      experience: [],
      education: [],
    };
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);

    const result = await service.getProfile(userId);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: userId } }),
    );
    expect(result).toEqual(fakeUser);
  });

  it('updateProfile hashes password and updates relations', async () => {
    const prismaModule: any = require('../../../src/prisma');
    const mockPrisma = prismaModule.default;
    const service = new UserService();
    const userId = 7;

    const tx = {
      user: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue({
          id: userId,
          email: 'a@b.c',
          name: 'Alice',
          phone: null,
          bio: null,
          avatar: null,
          skills: ['ts'],
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          experience: [],
          education: [],
        }),
      },
      experience: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
      education: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
    } as any;

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const payload = {
      name: 'Alice',
      password: 'new-password',
      skills: ['ts'],
      experience: [
        {
          title: 'Engineer',
          company: 'Acme',
          current: true,
          startDate: new Date('2020-01-01'),
          endDate: undefined,
          description: '',
        },
      ],
      education: [
        {
          school: 'Uni',
          degree: 'BSc',
          fieldOfStudy: 'CS',
          current: false,
          startDate: new Date('2016-01-01'),
          endDate: new Date('2020-01-01'),
          description: '',
        },
      ],
    } as any;

    const result = await service.updateProfile(userId, payload);

    // user update should receive the hashed password
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId },
        data: expect.objectContaining({
          name: 'Alice',
          password: 'hashed-password',
          skills: ['ts'],
        }),
      }),
    );

    // experience & education should be replaced
    expect(tx.experience.deleteMany).toHaveBeenCalledWith({
      where: { userId },
    });
    expect(tx.experience.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            title: 'Engineer',
            company: 'Acme',
            userId,
          }),
        ],
      }),
    );

    expect(tx.education.deleteMany).toHaveBeenCalledWith({ where: { userId } });
    expect(tx.education.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({ school: 'Uni', degree: 'BSc', userId }),
        ],
      }),
    );

    // final return is fetched via findUnique inside the transaction
    expect(result).toEqual(
      expect.objectContaining({ id: userId, name: 'Alice', skills: ['ts'] }),
    );
  });
});
