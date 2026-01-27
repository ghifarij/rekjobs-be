import { UserInterviewController } from '../../../../src/controller/user/userInterview.controller';

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserInterviewController', () => {
  let controller: UserInterviewController;
  let mockService: any;

  beforeEach(() => {
    controller = new UserInterviewController();
    mockService = {
      requestRescheduleInterview: jest.fn(),
      acceptInterview: jest.fn(),
    };
    (controller as any).userInterviewService = mockService;
  });

  it('requestReschedule forwards interviewId and user id and returns 200', async () => {
    const req: any = { user: { id: 10 }, params: { id: '55' } };
    const res = createMockRes();
    const next = jest.fn();
    const updated = { id: 55, status: 'REQUESTED_RESCHEDULE' };
    mockService.requestRescheduleInterview.mockResolvedValue(updated);

    await controller.requestReschedule(req, res as any, next as any);
    expect(mockService.requestRescheduleInterview).toHaveBeenCalledWith(55, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('acceptInterview forwards parsed ids and returns 200', async () => {
    const req: any = { user: { id: 11 }, params: { id: '99' } };
    const res = createMockRes();
    const next = jest.fn();
    const updated = { id: 99, status: 'ACCEPTED' };
    mockService.acceptInterview.mockResolvedValue(updated);

    await controller.acceptInterview(req, res as any, next as any);
    expect(mockService.acceptInterview).toHaveBeenCalledWith(99, 11);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('requestReschedule calls next when user missing (throws inside)', async () => {
    const req: any = { params: { id: '1' } };
    const res = createMockRes();
    const next = jest.fn();
    await controller.requestReschedule(req, res as any, next as any);
    expect(next).toHaveBeenCalled();
  });
});
