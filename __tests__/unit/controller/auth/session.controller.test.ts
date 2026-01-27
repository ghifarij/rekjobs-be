import { SessionController } from '../../../../src/controller/auth/session.controller';

// Relative mock to align with controller's '../../prisma' import resolution
jest.mock('../../../../src/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    company: { findUnique: jest.fn() },
  },
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const { default: prisma } = require('../../../../src/prisma');
const { verify } = require('jsonwebtoken');

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('SessionController.getSession', () => {
  const controller = new SessionController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no bearer token', async () => {
    const req: any = { headers: {} };
    const res = createMockRes();
    await controller.getSession(req, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
  });

  it('returns user session payload when type is user', async () => {
    (verify as jest.Mock).mockReturnValue({ id: 1, type: 'user' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Alice',
      email: 'a@a.com',
      avatar: 'pic',
      isVerified: true,
      googleId: 'g',
    });

    const req: any = { headers: { authorization: 'Bearer token' } };
    const res = createMockRes();
    await controller.getSession(req, res as any);

    expect(verify).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      type: 'user',
      id: 1,
      name: 'Alice',
      email: 'a@a.com',
      avatar: 'pic',
      isVerified: true,
      googleId: 'g',
    });
  });

  it('returns 404 when user not found', async () => {
    (verify as jest.Mock).mockReturnValue({ id: 2, type: 'user' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req: any = { headers: { authorization: 'Bearer token' } };
    const res = createMockRes();
    await controller.getSession(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns company session payload when type is company', async () => {
    (verify as jest.Mock).mockReturnValue({ id: 10, type: 'company' });
    (prisma.company.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
      name: 'Acme',
      email: 'c@c.com',
      logo: 'logo',
      isVerified: true,
      googleId: 'g2',
    });

    const req: any = { headers: { authorization: 'Bearer token' } };
    const res = createMockRes();
    await controller.getSession(req, res as any);

    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      type: 'company',
      id: 10,
      name: 'Acme',
      email: 'c@c.com',
      logo: 'logo',
      isVerified: true,
      googleId: 'g2',
    });
  });

  it('returns 403 for unknown session type', async () => {
    (verify as jest.Mock).mockReturnValue({ id: 3, type: 'other' });
    const req: any = { headers: { authorization: 'Bearer token' } };
    const res = createMockRes();
    await controller.getSession(req, res as any);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Unknown session type' });
  });

  it('returns 401 when token invalid or verify throws', async () => {
    (verify as jest.Mock).mockImplementation(() => { throw new Error('bad token'); });
    const req: any = { headers: { authorization: 'Bearer token' } };
    const res = createMockRes();
    await controller.getSession(req, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid or expired token' });
  });
});

