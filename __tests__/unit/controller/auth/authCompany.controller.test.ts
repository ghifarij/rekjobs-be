import { AuthCompanyController } from '../../../../src/controller/auth/authCompany.controller';

// Helper to create mock req/res/next
const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthCompanyController', () => {
  let controller: AuthCompanyController;
  let mockService: any;

  beforeEach(() => {
    controller = new AuthCompanyController();
    mockService = {
      loginCompany: jest.fn(),
      registerCompany: jest.fn(),
      verifyCompany: jest.fn(),
      socialLogin: jest.fn(),
      forgotPasswordCompany: jest.fn(),
      resetPasswordCompany: jest.fn(),
      checkVerificationStatus: jest.fn(),
    };
    // Override private service instance
    (controller as any).authCompanyService = mockService;
  });

  it('loginCompany responds with service result', async () => {
    const req: any = { body: { email: 'a@b.com', password: 'pw' } };
    const res = createMockRes();
    const next = jest.fn();
    const result = { token: 't', company: { id: 1 } };
    mockService.loginCompany.mockResolvedValue(result);

    await controller.loginCompany(req, res as any, next as any);

    expect(mockService.loginCompany).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(res.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });

  it('loginCompany forwards errors to next', async () => {
    const req: any = { body: { email: 'x@y.com', password: 'bad' } };
    const res = createMockRes();
    const next = jest.fn();
    const err = new Error('boom');
    mockService.loginCompany.mockRejectedValue(err);

    await controller.loginCompany(req, res as any, next as any);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('registerCompany responds with service result', async () => {
    const req: any = { body: { email: 'a@b.com' } };
    const res = createMockRes();
    const next = jest.fn();
    const result = { message: 'ok' };
    mockService.registerCompany.mockResolvedValue(result);

    await controller.registerCompany(req, res as any, next as any);
    expect(mockService.registerCompany).toHaveBeenCalledWith('a@b.com');
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('verifyCompany passes token and body to service', async () => {
    const body = {
      token: 'tok',
      name: 'Acme',
      password: 'pw',
      description: 'desc',
      website: 'site',
      location: 'loc',
      industry: 'ind',
      size: 'SMALL',
    };
    const req: any = { body };
    const res = createMockRes();
    const next = jest.fn();
    mockService.verifyCompany.mockResolvedValue({ ok: true });

    await controller.verifyCompany(req, res as any, next as any);

    expect(mockService.verifyCompany).toHaveBeenCalledWith('tok', {
      name: 'Acme',
      password: 'pw',
      description: 'desc',
      website: 'site',
      location: 'loc',
      industry: 'ind',
      size: 'SMALL',
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('socialLogin forwards fields and returns result', async () => {
    const req: any = {
      body: { googleId: 'gid', email: 'a@b.com', name: 'Acme', picture: 'pic' },
    };
    const res = createMockRes();
    const next = jest.fn();
    const result = { token: 'jwt' };
    mockService.socialLogin.mockResolvedValue(result);

    await controller.socialLogin(req, res as any, next as any);
    expect(mockService.socialLogin).toHaveBeenCalledWith(
      'gid',
      'a@b.com',
      'Acme',
      'pic',
    );
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('forgotPasswordCompany calls service with email', async () => {
    const req: any = { body: { email: 'a@b.com' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.forgotPasswordCompany.mockResolvedValue({ message: 'sent' });

    await controller.forgotPasswordCompany(req, res as any, next as any);
    expect(mockService.forgotPasswordCompany).toHaveBeenCalledWith('a@b.com');
    expect(res.json).toHaveBeenCalledWith({ message: 'sent' });
  });

  it('resetPasswordCompany calls service with token and password', async () => {
    const req: any = { body: { token: 'tok', password: 'new' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.resetPasswordCompany.mockResolvedValue({ message: 'ok' });

    await controller.resetPasswordCompany(req, res as any, next as any);
    expect(mockService.resetPasswordCompany).toHaveBeenCalledWith('tok', 'new');
    expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
  });

  it('checkVerificationStatus calls service with token', async () => {
    const req: any = { body: { token: 'tok' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.checkVerificationStatus.mockResolvedValue({ isVerified: true });

    await controller.checkVerificationStatus(req, res as any, next as any);
    expect(mockService.checkVerificationStatus).toHaveBeenCalledWith('tok');
    expect(res.json).toHaveBeenCalledWith({ isVerified: true });
  });
});
