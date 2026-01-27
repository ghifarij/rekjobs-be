import { JobController } from '../../../../src/controller/job/job.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('JobController', () => {
  let controller: JobController;
  let mockService: any;

  beforeEach(() => {
    controller = new JobController();
    mockService = {
      getAllJobs: jest.fn(),
      getJobBySlug: jest.fn(),
    };
    (controller as any).jobService = mockService;
  });

  describe('getAllJobs', () => {
    it('passes search query when provided', async () => {
      const req: any = { query: { search: 'engineer' } };
      const res = createMockRes();
      const next = jest.fn();
      const jobs = [{ id: 1 }];
      mockService.getAllJobs.mockResolvedValue(jobs);

      await controller.getAllJobs(req, res as any, next as any);
      expect(mockService.getAllJobs).toHaveBeenCalledWith('engineer');
      expect(res.json).toHaveBeenCalledWith(jobs);
    });

    it('passes undefined when search missing or empty', async () => {
      const res = createMockRes();
      const next = jest.fn();
      mockService.getAllJobs.mockResolvedValue([]);

      await controller.getAllJobs({ query: {} } as any, res as any, next as any);
      expect(mockService.getAllJobs).toHaveBeenCalledWith(undefined);

      await controller.getAllJobs({ query: { search: '' } } as any, res as any, next as any);
      expect(mockService.getAllJobs).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getJobBySlug', () => {
    it('returns 400 when slug missing', async () => {
      const req: any = { params: {} };
      const res = createMockRes();
      const next = jest.fn();
      await controller.getJobBySlug(req, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Slug is required' });
    });

    it('returns 404 when job not found', async () => {
      const req: any = { params: { slug: 'missing' } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.getJobBySlug.mockResolvedValue(null);
      await controller.getJobBySlug(req, res as any, next as any);
      expect(mockService.getJobBySlug).toHaveBeenCalledWith('missing');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('returns 200 with job when found', async () => {
      const req: any = { params: { slug: 'found' } };
      const res = createMockRes();
      const next = jest.fn();
      const job = { id: 123, slug: 'found' };
      mockService.getJobBySlug.mockResolvedValue(job);
      await controller.getJobBySlug(req, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(job);
    });
  });
});

