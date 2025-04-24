import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { Application, ApplicationStatus } from "../../prisma/generated/client";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  public async sendLoginEmail(email: string, token: string) {
    const templatePath = path.join(__dirname, "../templates/login.html");
    const source = fs.readFileSync(templatePath, "utf-8");
    const compiled = handlebars.compile(source);
    const html = compiled({ token });

    await this.sendEmail(email, "Your Login Link", html);
  }

  public async sendApplicationStatusUpdate(
    application: Application & {
      job: { title: string; company: { name: string } };
      applicant: { email: string; name: string };
    },
    status: ApplicationStatus
  ) {
    const { applicant, job } = application;
    const subject = `Update on Your Application for ${job.title} at ${job.company.name}`;

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 600; margin: 0;">RekJobs</h1>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Hello ${applicant.name},</h2>
          
          <p style="color: #4b5563; line-height: 1.5; margin-bottom: 16px;">
            Kami ingin memberitahu Anda tentang status pengajuan Anda untuk posisi 
            <strong style="color: #0f172a;">${job.title}</strong> di 
            <strong style="color: #0f172a;">${job.company.name}</strong>.
          </p>
    `;

    if (status === "PROCESSING") {
      html += `
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="color: #0369a1; font-weight: 600; margin: 0;">Status Lamaran: Diproses</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.5; margin-bottom: 16px;">
          Kami senang memberitahu Anda bahwa pengajuan Anda telah <strong style="color: #0f172a;">diterima</strong> untuk peninjauan lebih lanjut!
        </p>
        
        <p style="color: #4b5563; line-height: 1.5; margin-bottom: 16px;">
          Langkah selanjutnya dalam proses kami adalah menjadwalkan wawancara. Tim kami akan segera menghubungi Anda untuk menetapkan waktu yang sesuai.
        </p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Please prepare for the interview:</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Resume Anda yang diperbarui</li>
            <li style="margin-bottom: 8px;">Portofolio atau contoh pekerjaan yang relevan</li>
            <li style="margin-bottom: 8px;">Pertanyaan yang mungkin Anda miliki tentang posisi</li>
          </ul>
        </div>
      `;
    } else if (status === "REJECTED") {
      html += `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="color: #b91c1c; font-weight: 600; margin: 0;">Status Lamaran: Tidak Dipilih</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.5; margin-bottom: 16px;">
          Setelah mempertimbangkan secara saksama, kami telah memutuskan untuk tidak melanjutkan pengajuan Anda pada saat ini.
        </p>
        
        <p style="color: #4b5563; line-height: 1.5; margin-bottom: 16px;">
          Kami menghargai waktu dan usaha yang Anda lakukan untuk pengajuan Anda dan mendorong Anda untuk mendaftar kembali untuk kesempatan yang sesuai dengan keterampilan dan pengalaman Anda.
        </p>
      `;
    }

    html += `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/user/applied-jobs" 
             style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 24px;">
            View Your Applications
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #0f172a;">The ${job.company.name} Team</strong>
          </p>
        </div>
      </div>
    </div>
    `;

    await this.sendEmail(applicant.email, subject, html);
  }
}
