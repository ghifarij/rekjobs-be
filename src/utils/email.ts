import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const verificationEmailTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to RekJobs!</h1>
    </div>
    <div class="content">
        <h2>Verifikasi Email Diperlukan</h2>
        <p>Terima kasih telah mendaftar di RekJobs! Untuk menyelesaikan pendaftaran Anda dan mengakses semua fitur, silakan verifikasi alamat email Anda.</p>
        <p>Langkah ini memastikan keamanan akun Anda dan membantu kami menjaga komunitas yang dipercayai antara pencari kerja dan pemberi kerja.</p>
        <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verifikasi Email Anda</a>
        </div>
        <p>Link verifikasi ini akan kedaluwarsa dalam 1 jam untuk alasan keamanan.</p>
    </div>
    <div class="footer">
        <p>Jika Anda tidak membuat akun di RekJobs, silakan abaikan email ini.</p>
        <p>© 2024 RekJobs. Semua hak dilindungi.</p>
    </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    console.log("Attempting to send email to:", to);
    console.log("Using SMTP configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendUserVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/user/verify-user/${token}`;
  await sendEmail({
    to,
    subject: "Verifikasi Akun RekJobs",
    html: verificationEmailTemplate(verificationLink),
  });
};

export const sendCompanyVerificationEmail = async (
  to: string,
  token: string
) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/company/verify-company/${token}`;
  await sendEmail({
    to,
    subject: "Verifikasi Akun RekJobs",
    html: verificationEmailTemplate(verificationLink),
  });
};
