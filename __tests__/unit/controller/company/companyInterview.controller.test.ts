import { CompanyInterviewController } from '../../../../src/controller/company/companyInterview.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('CompanyInterviewController', () => {
  let controller: CompanyInterviewController;
  let mockService: any;

  beforeEach(() => {
    controller = new CompanyInterviewController();
    mockService = {
      createInterview: jest.fn(),
      getCompanyInterviews: jest.fn(),
      rescheduleInterview: jest.fn(),
    };
    (controller as any).companyInterviewService = mockService;
  });

  it('createInterview forwards args and returns 201', async () => {
    const req: any = {
      body: {
        applicationId: '12',
        scheduledAt: '2024-01-01T10:00:00Z',
        notes: 'n',
      },
    };
    const res = createMockRes();
    const next = jest.fn();
    const interview = { id: 1 };
    mockService.createInterview.mockResolvedValue(interview);

    await controller.createInterview(req, res as any, next as any);

    expect(mockService.createInterview).toHaveBeenCalled();
    const call = (mockService.createInterview as jest.Mock).mock.calls[0];
    expect(call[0]).toBe(12);
    expect(call[1]).toBeInstanceOf(Date);
    expect(call[2]).toBe('n');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(interview);
  });

  it('getCompanyInterviews returns 401 when no company id', async () => {
    const req: any = { company: undefined };
    const res = createMockRes();
    const next = jest.fn();
    await controller.getCompanyInterviews(req, res as any, next as any);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it('getCompanyInterviews returns interviews when authorized', async () => {
    const req: any = { company: { id: 4 } };
    const res = createMockRes();
    const next = jest.fn();
    const data = [{ id: 1 }, { id: 2 }];
    mockService.getCompanyInterviews.mockResolvedValue(data);

    await controller.getCompanyInterviews(req, res as any, next as any);
    expect(mockService.getCompanyInterviews).toHaveBeenCalledWith(4);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it('reschedule forwards args and returns 200', async () => {
    const req: any = {
      company: { id: 5 },
      params: { id: '21' },
      body: { scheduledAt: '2025-01-01T09:00:00Z', notes: 'res' },
    };
    const res = createMockRes();
    const next = jest.fn();
    const updated = { id: 21, status: 'RESCHEDULED' };
    mockService.rescheduleInterview.mockResolvedValue(updated);

    await controller.reschedule(req, res as any, next as any);
    const call = (mockService.rescheduleInterview as jest.Mock).mock.calls[0];
    expect(call[0]).toBe(21);
    expect(call[1]).toBe(5);
    expect(call[2]).toBeInstanceOf(Date);
    expect(call[3]).toBe('res');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});
