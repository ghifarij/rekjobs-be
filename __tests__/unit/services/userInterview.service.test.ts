import { UserInterviewService } from "../../../src/services/userInterview.service";

jest.mock("../../../src/prisma", () => {
  const mocked = {
    interview: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { __esModule: true, default: mocked };
});

describe("UserInterviewService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requestRescheduleInterview enforces applicant and updates status", async () => {
    const prismaModule: any = require("../../../src/prisma");
    const mockPrisma = prismaModule.default;
    const svc = new UserInterviewService();

    // not found
    mockPrisma.interview.findUnique.mockResolvedValueOnce(null);
    await expect(svc.requestRescheduleInterview(1, 1)).rejects.toThrow("Interview not found");

    // forbidden
    mockPrisma.interview.findUnique.mockResolvedValueOnce({ id: 1, application: { applicantId: 2 } });
    await expect(svc.requestRescheduleInterview(1, 1)).rejects.toThrow("Forbidden");

    // ok
    mockPrisma.interview.findUnique.mockResolvedValueOnce({ id: 1, application: { applicantId: 1 } });
    const updated = { id: 1, status: "PENDING" } as any;
    mockPrisma.interview.update.mockResolvedValueOnce(updated);
    const r = await svc.requestRescheduleInterview(1, 1);
    expect(mockPrisma.interview.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: "PENDING" } });
    expect(r).toBe(updated);
  });

  it("acceptInterview enforces applicant and sets completed", async () => {
    const prismaModule: any = require("../../../src/prisma");
    const mockPrisma = prismaModule.default;
    const svc = new UserInterviewService();

    mockPrisma.interview.findUnique.mockResolvedValueOnce({ id: 2, application: { applicantId: 2 } });
    await expect(svc.acceptInterview(2, 1)).rejects.toThrow("Forbidden");

    mockPrisma.interview.findUnique.mockResolvedValueOnce({ id: 2, application: { applicantId: 1 } });
    const updated = { id: 2, status: "COMPLETED" } as any;
    mockPrisma.interview.update.mockResolvedValueOnce(updated);
    const r = await svc.acceptInterview(2, 1);
    expect(mockPrisma.interview.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { status: "COMPLETED" } });
    expect(r).toBe(updated);
  });
});
