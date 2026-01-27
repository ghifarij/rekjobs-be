import { UserController } from '../../../../src/controller/user/user.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  let controller: UserController;
  let mockService: any;

  beforeEach(() => {
    controller = new UserController();
    mockService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };
    (controller as any).userService = mockService;
  });

  describe('getProfile', () => {
    it('returns profile when found', async () => {
      const req: any = { user: { id: 1 } };
      const res = createMockRes();
      const next = jest.fn();
      const profile = { id: 1, name: 'Alice' };
      mockService.getProfile.mockResolvedValue(profile);

      await controller.getProfile(req, res as any, next as any);
      expect(mockService.getProfile).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(profile);
    });

    it('returns 404 when not found', async () => {
      const req: any = { user: { id: 2 } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.getProfile.mockResolvedValue(null);

      await controller.getProfile(req, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('forwards error when user id missing', async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getProfile(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
      const err = (next as jest.Mock).mock.calls[0][0];
      expect((err as Error).message).toBe('User ID not found');
    });
  });

  describe('updateProfile', () => {
    it('forwards minimal fields and returns updated', async () => {
      const req: any = {
        user: { id: 3 },
        body: {
          name: 'New',
          phone: '123',
          bio: 'b',
          avatar: 'a',
          skills: ['x'],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const updated = { id: 3, name: 'New' };
      mockService.updateProfile.mockResolvedValue(updated);

      await controller.updateProfile(req, res as any, next as any);
      expect(mockService.updateProfile).toHaveBeenCalledWith(3, {
        name: 'New',
        phone: '123',
        bio: 'b',
        avatar: 'a',
        skills: ['x'],
        password: undefined,
      });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('includes experience and education when provided', async () => {
      const req: any = {
        user: { id: 4 },
        body: {
          experience: [
            {
              title: 'Dev',
              company: 'Co',
              startDate: new Date('2020-01-01'),
              current: true,
            },
          ],
          education: [
            {
              school: 'Uni',
              degree: 'BSc',
              fieldOfStudy: 'CS',
              startDate: new Date('2018-01-01'),
              current: false,
            },
          ],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const updated = { id: 4 };
      mockService.updateProfile.mockResolvedValue(updated);

      await controller.updateProfile(req, res as any, next as any);
      expect(mockService.updateProfile).toHaveBeenCalledWith(4, {
        experience: req.body.experience,
        education: req.body.education,
        name: undefined,
        phone: undefined,
        bio: undefined,
        avatar: undefined,
        skills: undefined,
        password: undefined,
      });
    });

    it('forwards error when user id missing', async () => {
      const req: any = { body: {} };
      const res = createMockRes();
      const next = jest.fn();
      await controller.updateProfile(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });
});
