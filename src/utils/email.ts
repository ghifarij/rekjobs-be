import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
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
        <h2>Email Verification Required</h2>
        <p>Thank you for registering with RekJobs! To complete your registration and access all features, please verify your email address.</p>
        <p>This step ensures the security of your account and helps us maintain a trusted community of job seekers and employers.</p>
        <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Your Email</a>
        </div>
        <p>This verification link will expire in 1 hour for security reasons.</p>
    </div>
    <div class="footer">
        <p>If you didn't create an account with RekJobs, please ignore this email.</p>
        <p>© 2024 RekJobs. All rights reserved.</p>
    </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/user/verify-user/${token}`;
  await sendEmail({
    to,
    subject: "Verify Your RekJobs Account",
    html: verificationEmailTemplate(verificationLink),
  });
};
