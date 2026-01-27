import { CompanyController } from '../../../../src/controller/company/company.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CompanyController', () => {
  let controller: CompanyController;
  let mockService: any;

  beforeEach(() => {
    controller = new CompanyController();
    mockService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };
    (controller as any).companyService = mockService;
  });

  describe('getProfile', () => {
    it('returns 200 with profile when found', async () => {
      const req: any = { company: { id: 7 } };
      const res = createMockRes();
      const next = jest.fn();
      const profile = { id: 7, name: 'Acme' };
      mockService.getProfile.mockResolvedValue(profile);

      await controller.getProfile(req, res as any, next as any);

      expect(mockService.getProfile).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(profile);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 404 when profile not found', async () => {
      const req: any = { company: { id: 8 } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.getProfile.mockResolvedValue(null);

      await controller.getProfile(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });

    it('forwards error when company id missing', async () => {
      const req: any = { company: undefined };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getProfile(req, res as any, next as any);

      expect(next).toHaveBeenCalled();
      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('Company ID not found');
    });
  });

  describe('updateProfile', () => {
    it('calls service with parsed update data and returns 200', async () => {
      const req: any = {
        company: { id: 9 },
        body: {
          name: 'New',
          description: 'desc',
          website: 'site',
          logo: 'logo',
          location: 'loc',
          industry: 'ind',
          size: 'SMALL',
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const updated = { id: 9, name: 'New' };
      mockService.updateProfile.mockResolvedValue(updated);

      await controller.updateProfile(req, res as any, next as any);

      expect(mockService.updateProfile).toHaveBeenCalledWith(9, {
        name: 'New',
        description: 'desc',
        website: 'site',
        logo: 'logo',
        location: 'loc',
        industry: 'ind',
        size: 'SMALL',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('includes password when provided', async () => {
      const req: any = {
        company: { id: 10 },
        body: { name: 'X', password: 'secret' },
      };
      const res = createMockRes();
      const next = jest.fn();
      const updated = { id: 10, name: 'X' };
      mockService.updateProfile.mockResolvedValue(updated);

      await controller.updateProfile(req, res as any, next as any);
      expect(mockService.updateProfile).toHaveBeenCalledWith(10, {
        name: 'X',
        description: undefined,
        website: undefined,
        logo: undefined,
        location: undefined,
        industry: undefined,
        size: undefined,
        password: 'secret',
      });
    });

    it('forwards error when company id missing', async () => {
      const req: any = { body: {} };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateProfile(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });
});

