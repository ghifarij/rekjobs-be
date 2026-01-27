// Mock PrismaClient constructor used inside the service
const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../../prisma/generated/client', () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
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
  sendUserVerificationEmail: jest.fn(async () => {}),
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

import { AuthUserService } from '../../../src/services/authUser.service';

describe('AuthUserService', () => {
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

  it('loginUser returns token on valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: 'e@u.com',
      name: 'U',
      password: 'hash',
    });
    const svc = new AuthUserService();
    const res = await svc.loginUser('e@u.com', 'valid');
    expect(res.token).toBe('jwt-token');
    expect(res.user).toEqual({ id: 3, email: 'e@u.com', name: 'U' });
  });

  it('registerUser creates pending user and sends verification', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({});
    const svc = new AuthUserService();
    const out = await svc.registerUser('u@x.com');
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'u@x.com',
          verificationToken: expect.any(String),
          isVerified: false,
        }),
      }),
    );
    expect(emailUtils.sendUserVerificationEmail).toHaveBeenCalledWith(
      'u@x.com',
      expect.any(String),
    );
    expect(out).toEqual({ message: 'Verification email sent' });
  });

  it('verifyUser updates data and sets verified', async () => {
    jwt.verify.mockReturnValueOnce({ email: 'v@u.com' } as any);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 10, isVerified: false });
    mockPrisma.user.update.mockResolvedValue({});
    const svc = new AuthUserService();
    const res = await svc.verifyUser('tok', {
      username: 'Bob',
      password: 'new',
      no_handphone: '123',
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({
          name: 'Bob',
          phone: '123',
          password: expect.stringMatching(/^hashed_/),
          isVerified: true,
        }),
      }),
    );
    expect(res).toEqual({ message: 'Account verified successfully' });
  });

  it('forgotPassword sends reset email with link', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 8, email: 'z@u.com' });
    const svc = new AuthUserService();
    const out = await svc.forgotPassword('z@u.com');
    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'z@u.com',
        subject: expect.stringContaining('Reset Password'),
        html: expect.stringContaining(
          'https://fe/auth/user/reset-password?token=',
        ),
      }),
    );
    expect(out).toEqual({ message: 'Email reset password berhasil dikirim' });
  });

  it('resetPassword hashes and updates password', async () => {
    jwt.verify.mockReturnValueOnce({ id: 77 } as any);
    const token = 'resettok';
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 77,
      resetPasswordToken: token,
    });
    mockPrisma.user.update.mockResolvedValue({});
    const svc = new AuthUserService();
    const res = await svc.resetPassword(token, 'newpw');
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
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
    jwt.verify.mockReturnValueOnce({ email: 'v@u.com' } as any);
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'v@u.com',
      isVerified: true,
    });
    const svc = new AuthUserService();
    const res = await svc.checkVerificationStatus('tok');
    expect(res).toEqual({ isVerified: true, email: 'v@u.com' });
  });

  describe('socialLogin', () => {
    it('throws when googleId missing', async () => {
      const svc = new AuthUserService();
      await expect(svc.socialLogin('' as any)).rejects.toThrow(
        'Google ID is required',
      );
    });

    it('throws when email registered without googleId', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 1,
        email: 'a@u.com',
        googleId: null,
      });
      const svc = new AuthUserService();
      await expect(svc.socialLogin('gid-1', 'a@u.com')).rejects.toThrow(
        'Email already registered with password. Please use email login instead.',
      );
    });

    it('throws when email registered with different googleId', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 2,
        email: 'b@u.com',
        googleId: 'other',
      });
      const svc = new AuthUserService();
      await expect(svc.socialLogin('gid-2', 'b@u.com')).rejects.toThrow(
        'This email is already registered with a different Google account.',
      );
    });

    it('creates new user when not found by googleId', async () => {
      mockPrisma.user.findFirst
        .mockResolvedValueOnce(null) // by email
        .mockResolvedValueOnce(null); // by googleId
      mockPrisma.user.create.mockResolvedValue({
        id: 11,
        email: 'new@u.com',
        name: 'Google User gid-abc',
        avatar: 'pic',
      });
      const svc = new AuthUserService();
      const out = await svc.socialLogin(
        'gid-abcdef',
        'new@u.com',
        undefined,
        'pic',
      );
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(out.token).toBe('jwt-token');
      expect(out.user).toEqual({
        id: 11,
        email: 'new@u.com',
        name: 'Google User gid-abc',
        avatar: 'pic',
      });
      expect(out.message).toBe('Login successful');
    });

    it('updates existing user info when found by googleId', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null); // by email
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 21,
        email: 'old@u.com',
        name: 'Old',
        avatar: null,
        googleId: 'gid-21',
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 21,
        email: 'new@u.com',
        name: 'New',
        avatar: 'pic',
      });
      const svc = new AuthUserService();
      const out = await svc.socialLogin('gid-21', 'new@u.com', 'New', 'pic');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 21 },
          data: expect.objectContaining({
            email: 'new@u.com',
            name: 'New',
            avatar: 'pic',
          }),
        }),
      );
      expect(out.user).toEqual({
        id: 21,
        email: 'new@u.com',
        name: 'New',
        avatar: 'pic',
      });
    });
  });

  describe('loginUser negatives', () => {
    it('throws when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const svc = new AuthUserService();
      await expect(svc.loginUser('x@y.com', 'valid')).rejects.toThrow(
        'User not found',
      );
    });

    it('throws on invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 9,
        email: 'e@u.com',
        name: 'U',
        password: 'hash',
      });
      const svc = new AuthUserService();
      await expect(svc.loginUser('e@u.com', 'wrong')).rejects.toThrow(
        'Invalid password',
      );
    });
  });
});
