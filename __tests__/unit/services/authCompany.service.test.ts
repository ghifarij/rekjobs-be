// Mock PrismaClient constructor used inside the service
const mockPrisma: any = {
  company: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../../prisma/generated/client', () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  CompanySize: { SMALL: 'SMALL' },
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(
      async (pw: string, hash: string) => pw === 'valid' && !!hash,
    ),
    hash: jest.fn(async (pw: string) => `hashed_${pw}`),
  },
}));

// Token ops
const jwt = {
  sign: jest.fn(() => 'jwt-token'),
  verify: jest.fn((_token: string) => ({ email: 'foo@bar.com', id: 1 })),
};
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: jwt,
  sign: jwt.sign,
  verify: jwt.verify,
}));

// Email utils
const emailUtils = {
  sendEmail: jest.fn(async () => {}),
  sendCompanyVerificationEmail: jest.fn(async () => {}),
};
jest.mock('../../../src/utils/email', () => ({
  __esModule: true,
  ...emailUtils,
}));

// Reset template
jest.mock('../../../src/utils/resetPasswordEmail', () => ({
  __esModule: true,
  resetPasswordEmailTemplate: (link: string) => `TPL ${link}`,
}));

import { AuthCompanyService } from '../../../src/services/authCompany.service';

describe('AuthCompanyService', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_KEY: 'secret',
      NEXT_PUBLIC_BASE_URL_FE: 'https://fe',
    };
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  it('loginCompany returns token on valid credentials', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({
      id: 3,
      email: 'e@c.com',
      name: 'C',
      password: 'hash',
      logo: 'l',
    });
    const svc = new AuthCompanyService();
    const res = await svc.loginCompany('e@c.com', 'valid');
    expect(res.token).toBe('jwt-token');
    expect(res.company).toEqual({
      id: 3,
      email: 'e@c.com',
      name: 'C',
      logo: 'l',
    });
  });

  it('registerCompany creates pending company and sends verification', async () => {
    mockPrisma.company.findUnique.mockResolvedValue(null);
    mockPrisma.company.create.mockResolvedValue({});
    const svc = new AuthCompanyService();
    const out = await svc.registerCompany('c@x.com');
    expect(mockPrisma.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'c@x.com',
          verificationToken: expect.any(String),
          isVerified: false,
        }),
      }),
    );
    expect(emailUtils.sendCompanyVerificationEmail).toHaveBeenCalledWith(
      'c@x.com',
      expect.any(String),
    );
    expect(out).toEqual({ message: 'Verification email sent' });
  });

  it('verifyCompany updates data and clears token', async () => {
    jwt.verify.mockReturnValueOnce({ email: 'v@co.com' } as any);
    mockPrisma.company.findFirst.mockResolvedValue({
      id: 10,
      verificationToken: 'tok',
      isVerified: false,
    });
    mockPrisma.company.update.mockResolvedValue({});
    const svc = new AuthCompanyService();
    const res = await svc.verifyCompany('tok', {
      name: 'Acme',
      password: 'newpass',
    } as any);
    expect(mockPrisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({
          name: 'Acme',
          password: expect.stringMatching(/^hashed_/),
          isVerified: true,
          verificationToken: null,
        }),
      }),
    );
    expect(res).toEqual({ message: 'Account verified successfully' });
  });

  it('forgotPasswordCompany sends reset email with link', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({
      id: 8,
      email: 'z@c.com',
    });
    const svc = new AuthCompanyService();
    const out = await svc.forgotPasswordCompany('z@c.com');
    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'z@c.com',
        subject: expect.stringContaining('Reset Password'),
        html: expect.stringContaining(
          'https://fe/auth/company/reset-password?token=',
        ),
      }),
    );
    expect(out).toEqual({ message: 'Email reset password berhasil dikirim' });
  });

  it('resetPasswordCompany hashes and updates password', async () => {
    jwt.verify.mockReturnValueOnce({ id: 77 } as any);
    const token = 'resettok';
    mockPrisma.company.findUnique.mockResolvedValue({
      id: 77,
      resetPasswordToken: token,
    });
    mockPrisma.company.update.mockResolvedValue({});
    const svc = new AuthCompanyService();
    const res = await svc.resetPasswordCompany(token, 'newpw');
    expect(mockPrisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 77 },
        data: expect.objectContaining({
          password: expect.stringMatching(/^hashed_/),
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }),
      }),
    );
    expect(res).toEqual({ message: 'Password reset successfully' });
  });

  it('checkVerificationStatus returns verification flag', async () => {
    jwt.verify.mockReturnValueOnce({ email: 'v@co.com' } as any);
    mockPrisma.company.findUnique.mockResolvedValue({
      email: 'v@co.com',
      isVerified: true,
    });
    const svc = new AuthCompanyService();
    const res = await svc.checkVerificationStatus('tok');
    expect(res).toEqual({ isVerified: true, email: 'v@co.com' });
  });

  describe('socialLogin', () => {
    it('throws when googleId missing', async () => {
      const svc = new AuthCompanyService();
      await expect(svc.socialLogin('' as any)).rejects.toThrow(
        'Google ID is required',
      );
    });

    it('throws when email registered without googleId', async () => {
      // first findFirst by email returns existing without googleId
      mockPrisma.company.findFirst.mockResolvedValueOnce({
        id: 1,
        email: 'a@c.com',
        googleId: null,
      });
      const svc = new AuthCompanyService();
      await expect(svc.socialLogin('gid-1', 'a@c.com')).rejects.toThrow(
        'Email already registered with password. Please use email login instead.',
      );
    });

    it('throws when email registered with different googleId', async () => {
      mockPrisma.company.findFirst.mockResolvedValueOnce({
        id: 2,
        email: 'b@c.com',
        googleId: 'other',
      });
      const svc = new AuthCompanyService();
      await expect(svc.socialLogin('gid-2', 'b@c.com')).rejects.toThrow(
        'This email is already registered with a different Google account.',
      );
    });

    it('creates new company when not found by googleId', async () => {
      // 1) check by email -> null
      // 2) check by googleId -> null
      mockPrisma.company.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.company.create.mockResolvedValue({
        id: 11,
        email: 'new@c.com',
        name: 'Google Company gid-abc',
        logo: 'pic',
      });
      const svc = new AuthCompanyService();
      const out = await svc.socialLogin(
        'gid-abcdef',
        'new@c.com',
        undefined,
        'pic',
      );
      expect(mockPrisma.company.create).toHaveBeenCalled();
      expect(out.token).toBe('jwt-token');
      expect(out.company).toEqual({
        id: 11,
        email: 'new@c.com',
        name: 'Google Company gid-abc',
        logo: 'pic',
      });
      expect(out.message).toBe('Login successful');
    });

    it('updates existing company info when found by googleId', async () => {
      // 1) check by email -> null
      mockPrisma.company.findFirst.mockResolvedValueOnce(null);
      // 2) found by googleId
      mockPrisma.company.findFirst.mockResolvedValueOnce({
        id: 21,
        email: 'old@c.com',
        name: 'Old',
        logo: null,
        googleId: 'gid-21',
      });
      mockPrisma.company.update.mockResolvedValue({
        id: 21,
        email: 'new@c.com',
        name: 'New',
        logo: 'pic',
      });
      const svc = new AuthCompanyService();
      const out = await svc.socialLogin('gid-21', 'new@c.com', 'New', 'pic');
      expect(mockPrisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 21 },
          data: expect.objectContaining({
            email: 'new@c.com',
            name: 'New',
            logo: 'pic',
          }),
        }),
      );
      expect(out.company).toEqual({
        id: 21,
        email: 'new@c.com',
        name: 'New',
        logo: 'pic',
      });
    });
  });

  describe('loginCompany negatives', () => {
    it('throws when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);
      const svc = new AuthCompanyService();
      await expect(svc.loginCompany('x@y.com', 'valid')).rejects.toThrow(
        'Company not found',
      );
    });

    it('throws on invalid password', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        id: 9,
        email: 'e@c.com',
        name: 'C',
        password: 'hash',
        logo: null,
      });
      const svc = new AuthCompanyService();
      await expect(svc.loginCompany('e@c.com', 'wrong')).rejects.toThrow(
        'Invalid password',
      );
    });
  });
});
