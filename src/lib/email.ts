import nodemailer from 'nodemailer'

// Create email transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number.parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string, name?: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: `"AI-Sec Platform" <${process.env.SMTP_FROM || 'noreply@ai-sec.com'}>`,
    to: email,
    subject: 'Password Reset Request - AI-Sec Platform',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'User'},</p>
              <p>We received a request to reset your password for your AI-Sec Platform account.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
              <p style="color: #ef4444; font-weight: bold;">
                This link will expire in 1 hour.
              </p>
              <p style="color: #666; font-size: 14px;">
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 AI-Sec Platform | Secure GenAI Gateway</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Password reset email sent to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error)
    // In development, log the reset URL
    console.log(`🔗 Reset URL: ${resetUrl}`)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const mailOptions = {
    from: `"AI-Sec Platform" <${process.env.SMTP_FROM || 'noreply@ai-sec.com'}>`,
    to: email,
    subject: 'Welcome to AI-Sec Platform',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to AI-Sec Platform!</h1>
            <p>Hello ${name || 'User'},</p>
            <p>Your account has been successfully created.</p>
            <p>You can now access the Secure GenAI Gateway with enterprise-grade security features.</p>
            <p>Thank you for joining us!</p>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Welcome email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
  }
}
