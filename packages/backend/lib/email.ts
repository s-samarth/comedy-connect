
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})

export async function sendAdminResetEmail(email: string, code: string) {
    try {
        const info = await transporter.sendMail({
            from: `Comedy Connect <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Admin Password Reset Code - Comedy Connect',
            text: `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1e293b; text-align: center;">Admin Password Reset</h2>
          <p style="color: #475569; font-size: 16px;">You requested a password reset for the Comedy Connect Admin Portal.</p>
          <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin-bottom: 8px; font-size: 14px;">Your Verification Code:</p>
            <p style="color: #0f172a; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">${code}</p>
          </div>
          <p style="color: #475569; font-size: 14px;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `,
        })

        console.log('Reset email sent:', info.messageId)
        return { success: true }
    } catch (error) {
        console.error('Error sending reset email:', error)
        return { success: false, error }
    }
}
