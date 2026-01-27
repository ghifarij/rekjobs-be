import { EmailService } from "../../../src/services/email.service";

jest.mock("nodemailer", () => {
  const transport = { sendMail: jest.fn().mockResolvedValue({}) };
  (global as any).__testTransport = transport;
  const createTransport = jest.fn(() => transport);
  return {
    __esModule: true,
    default: { createTransport },
    createTransport,
  } as any;
});

jest.mock("fs", () => {
  const readFileSync = jest.fn(() => "Hello {{token}}");
  return { __esModule: true, default: { readFileSync }, readFileSync } as any;
});

jest.mock("handlebars", () => {
  const compile = jest.fn((source: string) => (ctx: any) => source.replace("{{token}}", ctx.token));
  return { __esModule: true, default: { compile }, compile } as any;
});

describe("EmailService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.SMTP_FROM = "from@example.com";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("sends login email with compiled template", async () => {
    const service = new EmailService();
    await service.sendLoginEmail("user@example.com", "abc123");
    const transport = (global as any).__testTransport;
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "from@example.com",
        to: "user@example.com",
        subject: "Your Login Link",
        html: "Hello abc123",
      })
    );
  });

  it("sends application status email for PROCESSING", async () => {
    const service = new EmailService();
    const transport = (global as any).__testTransport;
    const application: any = {
      applicant: { email: "user@example.com", name: "User" },
      job: { title: "Engineer", company: { name: "Acme" } },
    };

    await service.sendApplicationStatusUpdate(application, "PROCESSING" as any);

    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Update on Your Application for Engineer at Acme",
        html: expect.stringContaining("Status Lamaran: Diproses"),
      })
    );
  });

  it("sends application status email for REJECTED", async () => {
    const service = new EmailService();
    const transport = (global as any).__testTransport;
    const application: any = {
      applicant: { email: "user2@example.com", name: "Another" },
      job: { title: "Designer", company: { name: "Globex" } },
    };

    await service.sendApplicationStatusUpdate(application, "REJECTED" as any);

    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user2@example.com",
        subject: "Update on Your Application for Designer at Globex",
        html: expect.stringContaining("Status Lamaran: Tidak Dipilih"),
      })
    );
  });
});
