import { CompanyApplicationController } from '../../../../src/controller/company/companyApplication.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('CompanyApplicationController', () => {
  let controller: CompanyApplicationController;
  let mockService: any;

  beforeEach(() => {
    controller = new CompanyApplicationController();
    mockService = {
      getCompanyApplications: jest.fn(),
      getApplicationById: jest.fn(),
      updateApplicationStatus: jest.fn(),
    };
    (controller as any).companyApplicationService = mockService;
  });

  it('getCompanyApplications returns 401 if no company id', async () => {
    const req: any = { company: undefined };
    const res = createMockRes();
    const next = jest.fn();
    await controller.getCompanyApplications(req, res as any, next as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('getCompanyApplications returns applications for company', async () => {
    const req: any = { company: { id: 3 } };
    const res = createMockRes();
    const next = jest.fn();
    const apps = [{ id: 1 }, { id: 2 }];
    mockService.getCompanyApplications.mockResolvedValue(apps);

    await controller.getCompanyApplications(req, res as any, next as any);
    expect(mockService.getCompanyApplications).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ applications: apps });
  });

  it('getApplicationById returns 401 if no company id', async () => {
    const req: any = { company: undefined, params: { id: '10' } };
    const res = createMockRes();
    const next = jest.fn();
    await controller.getApplicationById(req, res as any, next as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('getApplicationById returns details when authorized', async () => {
    const req: any = { company: { id: 5 }, params: { id: '42' } };
    const res = createMockRes();
    const next = jest.fn();
    const details = { id: 42, status: 'PENDING' };
    mockService.getApplicationById.mockResolvedValue(details);

    await controller.getApplicationById(req, res as any, next as any);
    expect(mockService.getApplicationById).toHaveBeenCalledWith(5, 42);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ details });
  });

  it('updateApplicationStatus returns 401 if no company id', async () => {
    const req: any = { company: undefined, params: { id: '1' }, body: { status: 'ACCEPTED' } };
    const res = createMockRes();
    const next = jest.fn();
    await controller.updateApplicationStatus(req, res as any, next as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('updateApplicationStatus forwards args and returns result', async () => {
    const req: any = { company: { id: 6 }, params: { id: '11' }, body: { status: 'REJECTED' } };
    const res = createMockRes();
    const next = jest.fn();
    const updated = { id: 11, status: 'REJECTED' };
    mockService.updateApplicationStatus.mockResolvedValue(updated);

    await controller.updateApplicationStatus(req, res as any, next as any);
    expect(mockService.updateApplicationStatus).toHaveBeenCalledWith(6, 11, 'REJECTED');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

