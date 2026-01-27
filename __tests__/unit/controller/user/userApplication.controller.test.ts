import { UserApplicationController } from '../../../../src/controller/user/userApplication.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserApplicationController', () => {
  let controller: UserApplicationController;
  let mockService: any;

  beforeEach(() => {
    controller = new UserApplicationController();
    mockService = {
      createApplication: jest.fn(),
      getUserApplications: jest.fn(),
      deleteApplication: jest.fn(),
    };
    (controller as any).applicationService = mockService;
  });

  describe('createApplication', () => {
    it('requires user id and jobId, forwards files and returns 201', async () => {
      const coverLetterFile = { filename: 'cover.txt' } as any;
      const resumeFile = { filename: 'resume.pdf' } as any;
      const req: any = {
        user: { id: 1 },
        body: { jobId: '10' },
        files: { coverLetter: [coverLetterFile], resume: [resumeFile] },
      };
      const res = createMockRes();
      const next = jest.fn();
      const application = { id: 99 };
      mockService.createApplication.mockResolvedValue(application);

      await controller.createApplication(req, res as any, next as any);
      expect(mockService.createApplication).toHaveBeenCalledWith(1, 10, {
        coverLetterFile,
        resumeFile,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(application);
    });

    it('calls next when user id missing', async () => {
      const req: any = { body: { jobId: '1' } };
      const res = createMockRes();
      const next = jest.fn();
      await controller.createApplication(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });

    it('calls next when jobId missing', async () => {
      const req: any = { user: { id: 2 }, body: {} };
      const res = createMockRes();
      const next = jest.fn();
      await controller.createApplication(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getUserApplications', () => {
    it('returns applications for user', async () => {
      const req: any = { user: { id: 5 } };
      const res = createMockRes();
      const next = jest.fn();
      const apps = [{ id: 1 }];
      mockService.getUserApplications.mockResolvedValue(apps);

      await controller.getUserApplications(req, res as any, next as any);
      expect(mockService.getUserApplications).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(apps);
    });

    it('calls next when user id missing', async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();
      await controller.getUserApplications(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteApplication', () => {
    it('parses id and returns success message', async () => {
      const req: any = { user: { id: 6 }, params: { id: '77' } };
      const res = createMockRes();
      const next = jest.fn();
      mockService.deleteApplication.mockResolvedValue(undefined);

      await controller.deleteApplication(req, res as any, next as any);
      expect(mockService.deleteApplication).toHaveBeenCalledWith(77, 6);
      expect(res.json).toHaveBeenCalledWith({ message: 'Application deleted successfully' });
    });

    it('calls next when user id missing', async () => {
      const req: any = { params: { id: '77' } };
      const res = createMockRes();
      const next = jest.fn();
      await controller.deleteApplication(req, res as any, next as any);
      expect(next).toHaveBeenCalled();
    });
  });
});

