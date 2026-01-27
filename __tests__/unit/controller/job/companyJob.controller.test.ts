import { CompanyJobController } from '../../../../src/controller/job/companyJob.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CompanyJobController', () => {
  let controller: CompanyJobController;
  let mockService: any;

  beforeEach(() => {
    controller = new CompanyJobController();
    mockService = {
      createJob: jest.fn(),
      updateJob: jest.fn(),
      deleteJob: jest.fn(),
      getCompanyJobs: jest.fn(),
      getJobById: jest.fn(),
    };
    (controller as any).jobService = mockService;
  });

  describe('createJob', () => {
    it('forwards args and returns result', async () => {
      const req: any = {
        company: { id: 2 },
        body: {
          title: 'Title',
          description: 'Desc',
          location: 'Loc',
          requirements: 'Req',
          salary: '100',
          jobType: 'FULL_TIME',
          experience: '2y',
          deadline: '2025-01-01T00:00:00Z',
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const job = { id: 1 };
      mockService.createJob.mockResolvedValue(job);

      await controller.createJob(req, res as any, next as any);
      const call = (mockService.createJob as jest.Mock).mock.calls[0];
      expect(call[0]).toBe(2);
      expect(call[1]).toMatchObject({ title: 'Title', description: 'Desc' });
      expect(call[1].deadline).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith(job);
    });

    it('calls next on missing company id', async () => {
      const req: any = { body: {} };
      const res = createMockRes();
      const next = jest.fn();
      await controller.createJob(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
      const err = (next as jest.Mock).mock.calls[0][0];
      expect((err as Error).message).toBe('Company ID not found');
    });
  });

  describe('updateJob', () => {
    it('parses ids and forwards data', async () => {
      const req: any = {
        company: { id: 2 },
        params: { id: '11' },
        body: {
          title: 'New',
          deadline: '2026-02-02T00:00:00Z',
          isActive: true,
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const job = { id: 11, title: 'New' };
      mockService.updateJob.mockResolvedValue(job);

      await controller.updateJob(req, res as any, next as any);
      expect(mockService.updateJob).toHaveBeenCalled();
      const call = (mockService.updateJob as jest.Mock).mock.calls[0];
      expect(call[0]).toBe(11);
      expect(call[1]).toBe(2);
      expect(call[2]).toMatchObject({ title: 'New', isActive: true });
      expect(call[2].deadline).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith(job);
    });

    it('calls next on missing company id', async () => {
      const req: any = { params: { id: '1' }, body: {} };
      const res = createMockRes();
      const next = jest.fn();
      await controller.updateJob(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteJob', () => {
    it('parses ids, calls service, returns message', async () => {
      const req: any = { company: { id: 3 }, params: { id: '5' } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.deleteJob.mockResolvedValue(undefined);

      await controller.deleteJob(req, res as any, next as any);
      expect(mockService.deleteJob).toHaveBeenCalledWith(5, 3);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Job deleted successfully',
      });
    });

    it('calls next on missing company id', async () => {
      const req: any = { params: { id: '5' } };
      const res = createMockRes();
      const next = jest.fn();
      await controller.deleteJob(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getJobs', () => {
    it('returns jobs for company', async () => {
      const req: any = { company: { id: 4 } };
      const res = createMockRes();
      const next = jest.fn();
      const jobs = [{ id: 1 }];
      mockService.getCompanyJobs.mockResolvedValue(jobs);

      await controller.getJobs(req, res as any, next as any);
      expect(mockService.getCompanyJobs).toHaveBeenCalledWith(4);
      expect(res.json).toHaveBeenCalledWith(jobs);
    });

    it('calls next on missing company id', async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();
      await controller.getJobs(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getJobById', () => {
    it('returns 404 when not found or unauthorized', async () => {
      const req: any = { company: { id: 7 }, params: { id: '99' } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.getJobById.mockResolvedValue(null);

      await controller.getJobById(req, res as any, next as any);
      expect(mockService.getJobById).toHaveBeenCalledWith(99, 7);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Job not found or unauthorized',
      });
    });

    it('returns job when found', async () => {
      const req: any = { company: { id: 7 }, params: { id: '2' } };
      const res = createMockRes();
      const next = jest.fn();
      const job = { id: 2 };
      mockService.getJobById.mockResolvedValue(job);

      await controller.getJobById(req, res as any, next as any);
      expect(res.json).toHaveBeenCalledWith(job);
    });
  });
});
