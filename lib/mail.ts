import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Reset Password Code - FreeKanban",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Use the following code to reset your password:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">${token}</h1>
          <p>This code is valid for 15 minutes.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    return false;
  }
}
