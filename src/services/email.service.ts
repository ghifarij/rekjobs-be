import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(
    templateName: string,
    data: any,
    to: string,
    subject: string
  ): Promise<void> {
    const templatePath = path.join(__dirname, "../templates", templateName);
    const source = fs.readFileSync(templatePath, "utf-8");
    const compiled = handlebars.compile(source);
    const html = compiled(data);

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  }
}
