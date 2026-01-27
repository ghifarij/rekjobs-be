import { AuthUserController } from '../../../../src/controller/auth/authUser.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthUserController', () => {
  let controller: AuthUserController;
  let mockService: any;

  beforeEach(() => {
    controller = new AuthUserController();
    mockService = {
      loginUser: jest.fn(),
      registerUser: jest.fn(),
      verifyUser: jest.fn(),
      socialLogin: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      checkVerificationStatus: jest.fn(),
    };
    // Override private service instance
    (controller as any).authUserService = mockService;
  });

  it('loginUser responds with service result', async () => {
    const req: any = { body: { email: 'u@u.com', password: 'pw' } };
    const res = createMockRes();
    const next = jest.fn();
    const result = { token: 't', user: { id: 1 } };
    mockService.loginUser.mockResolvedValue(result);

    await controller.loginUser(req, res as any, next as any);
    expect(mockService.loginUser).toHaveBeenCalledWith('u@u.com', 'pw');
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('registerUser calls service with email', async () => {
    const req: any = { body: { email: 'u@u.com' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.registerUser.mockResolvedValue({ message: 'sent' });

    await controller.registerUser(req, res as any, next as any);
    expect(mockService.registerUser).toHaveBeenCalledWith('u@u.com');
    expect(res.json).toHaveBeenCalledWith({ message: 'sent' });
  });

  it('verifyUser forwards token and payload', async () => {
    const body = {
      token: 'tok',
      username: 'alice',
      password: 'pw',
      no_handphone: '123',
    };
    const req: any = { body };
    const res = createMockRes();
    const next = jest.fn();
    mockService.verifyUser.mockResolvedValue({ ok: true });

    await controller.verifyUser(req, res as any, next as any);
    expect(mockService.verifyUser).toHaveBeenCalledWith('tok', {
      username: 'alice',
      password: 'pw',
      no_handphone: '123',
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('socialLogin forwards fields and returns result', async () => {
    const req: any = {
      body: { googleId: 'gid', email: 'u@u.com', name: 'Al', picture: 'pic' },
    };
    const res = createMockRes();
    const next = jest.fn();
    const result = { token: 'jwt' };
    mockService.socialLogin.mockResolvedValue(result);

    await controller.socialLogin(req, res as any, next as any);
    expect(mockService.socialLogin).toHaveBeenCalledWith(
      'gid',
      'u@u.com',
      'Al',
      'pic',
    );
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('forgotPasswordUser calls service with email', async () => {
    const req: any = { body: { email: 'u@u.com' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.forgotPassword.mockResolvedValue({ message: 'sent' });

    await controller.forgotPasswordUser(req, res as any, next as any);
    expect(mockService.forgotPassword).toHaveBeenCalledWith('u@u.com');
    expect(res.json).toHaveBeenCalledWith({ message: 'sent' });
  });

  it('resetPasswordUser calls service with token and password', async () => {
    const req: any = { body: { token: 'tok', password: 'new' } };
    const res = createMockRes();
    const next = jest.fn();
    mockService.resetPassword.mockResolvedValue({ message: 'ok' });

    await controller.resetPasswordUser(req, res as any, next as any);
    expect(mockService.resetPassword).toHaveBeenCalledWith('tok', 'new');
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
