import { CompanyApplicationService } from "../../../src/services/companyApplication.service";

// Mock prisma singleton used by CompanyApplicationService
jest.mock("../../../src/prisma", () => {
  const mocked = {
    application: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    job: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  return { __esModule: true, default: mocked };
});

// Mock EmailService used internally
const emailMock = { sendApplicationStatusUpdate: jest.fn() };
jest.mock("../../../src/services/email.service", () => ({
  __esModule: true,
  EmailService: jest.fn().mockImplementation(() => emailMock),
}));

describe("CompanyApplicationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCompanyApplications queries by companyId and returns list", async () => {
    const prismaModule: any = require("../../../src/prisma");
    const mockPrisma = prismaModule.default;
    const svc = new CompanyApplicationService();
    const apps = [{ id: 1 }, { id: 2 }];
    mockPrisma.application.findMany.mockResolvedValue(apps);

    const result = await svc.getCompanyApplications(9);
    expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
      where: { job: { companyId: 9 } },
      include: { job: { include: { company: true } }, applicant: true, interviews: true },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toBe(apps);
  });

  it("getApplicationById maps fields and enforces ownership", async () => {
    const prismaModule: any = require("../../../src/prisma");
    const mockPrisma = prismaModule.default;
    const svc = new CompanyApplicationService();
    const app = {
      id: 5,
      status: "PENDING",
      coverLetter: "cl",
      resume: "rv",
      job: { id: 2, title: "Dev", slug: "dev", companyId: 7 },
      applicant: {
        id: 10,
        name: "User",
        email: "u@x.com",
        avatar: null,
        bio: null,
        phone: null,
        skills: ["ts"],
        experience: [
          { title: "E1", company: "C1", location: null, startDate: new Date("2020-01-01"), endDate: null, current: true, description: null },
        ],
        education: [
          { school: "S1", degree: "D1", fieldOfStudy: "CS", startDate: new Date("2016-01-01"), endDate: new Date("2020-01-01"), current: false, description: null },
        ],
      },
      interviews: [ { id: 1, scheduledAt: new Date("2025-01-01"), status: "SCHEDULED", notes: null } ],
    } as any;
    mockPrisma.application.findUnique.mockResolvedValue(app);

    const result = await svc.getApplicationById(7, 5);
    expect(result).toEqual(expect.objectContaining({
      id: 5,
      job: { id: 2, title: "Dev", slug: "dev" },
      applicant: expect.objectContaining({
        experience: [ expect.objectContaining({ startDate: expect.stringMatching(/^2020-01-01/), endDate: null }) ],
        education: [ expect.objectContaining({ startDate: expect.stringMatching(/^2016-01-01/), endDate: expect.stringMatching(/^2020-01-01/) }) ],
      }),
    }));

    // not found
    mockPrisma.application.findUnique.mockResolvedValueOnce(null);
    await expect(svc.getApplicationById(7, 999)).rejects.toThrow("Application not found");

    // forbidden
    mockPrisma.application.findUnique.mockResolvedValueOnce({ ...app, job: { ...app.job, companyId: 8 } });
    await expect(svc.getApplicationById(7, 5)).rejects.toThrow("Forbidden");
  });

  it("updateApplicationStatus updates, sends email, and returns updated app", async () => {
    const prismaModule: any = require("../../../src/prisma");
    const mockPrisma = prismaModule.default;
    const svc = new CompanyApplicationService();
    const found = { id: 3, job: { companyId: 4 }, applicant: {}, interviews: [] } as any;
    const updated = { id: 3, status: "PROCESSING", job: { company: {} }, applicant: {}, interviews: [] } as any;
    mockPrisma.application.findUnique.mockResolvedValue(found);
    mockPrisma.application.update.mockResolvedValue(updated);

    const res = await svc.updateApplicationStatus(4, 3, "PROCESSING" as any);
    expect(mockPrisma.application.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status: "PROCESSING" },
      include: { job: { include: { company: true } }, applicant: true, interviews: true },
    });
    expect(emailMock.sendApplicationStatusUpdate).toHaveBeenCalledWith(updated, "PROCESSING");
    expect(res).toBe(updated);

    // application not found
    mockPrisma.application.findUnique.mockResolvedValueOnce(null);
    await expect(svc.updateApplicationStatus(4, 3, "REJECTED" as any)).rejects.toThrow("Application not found");

    // permission
    mockPrisma.application.findUnique.mockResolvedValueOnce({ id: 1, job: { companyId: 99 } } as any);
    await expect(svc.updateApplicationStatus(4, 1, "PROCESSING" as any)).rejects.toThrow("permission");

    // email failure should not throw
    mockPrisma.application.findUnique.mockResolvedValueOnce(found);
    mockPrisma.application.update.mockResolvedValueOnce(updated);
    (emailMock.sendApplicationStatusUpdate as jest.Mock).mockRejectedValueOnce(new Error("smtp fail"));
    await expect(svc.updateApplicationStatus(4, 3, "PROCESSING" as any)).resolves.toEqual(updated);
  });
});
