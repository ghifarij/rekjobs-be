"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordEmailTemplate = void 0;
const resetPasswordEmailTemplate = (resetLink) => `
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
      <h1>Reset Password - RekJobs</h1>
    </div>
    <div class="content">
      <h2>Reset Password Anda</h2>
      <p>Halo,</p>
      <p>Kami menerima permintaan untuk mereset password akun RekJobs Anda. Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.</p>
      <p>Untuk mereset password Anda, silakan klik tombol di bawah ini:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Link ini akan kadaluarsa dalam 1 jam.</p>
      <p>Salam,<br>Tim RekJobs</p>
    </div>
    <div class="footer">
      <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di support@rekjobs.com</p>
      <p>© ${new Date().getFullYear()} RekJobs. Semua hak dilindungi.</p>
    </div>
  </body>
</html>
`;
exports.resetPasswordEmailTemplate = resetPasswordEmailTemplate;
//# sourceMappingURL=resetPasswordEmail.js.map