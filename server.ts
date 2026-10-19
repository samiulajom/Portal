import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // In-memory runtime SMTP config (allows testing or updating without restarting server)
  let runtimeSmtpConfig = {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || ''
  };

  // Helper to create a nodemailer transporter
  async function getTransporter() {
    const host = runtimeSmtpConfig.host || process.env.SMTP_HOST;
    const port = runtimeSmtpConfig.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587);
    const user = runtimeSmtpConfig.user || process.env.SMTP_USER;
    const pass = runtimeSmtpConfig.pass || process.env.SMTP_PASS;

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Free test account (Ethereal) fallback if no custom credentials are configured yet
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (e) {
      console.warn('Could not initialize ethereal fallback:', e);
      return null;
    }
  }

  // API endpoint: Get SMTP configuration status
  app.get('/api/smtp-status', (req, res) => {
    const hasConfig = Boolean(
      (runtimeSmtpConfig.host || process.env.SMTP_HOST) &&
      (runtimeSmtpConfig.user || process.env.SMTP_USER) &&
      (runtimeSmtpConfig.pass || process.env.SMTP_PASS)
    );

    res.json({
      configured: hasConfig,
      host: runtimeSmtpConfig.host || process.env.SMTP_HOST || 'Not configured (using test fallback)',
      user: runtimeSmtpConfig.user || process.env.SMTP_USER ? '••••' + (runtimeSmtpConfig.user || process.env.SMTP_USER || '').slice(-10) : 'None'
    });
  });

  // API endpoint: Update runtime SMTP settings (for easy free Gmail App Password testing)
  app.post('/api/smtp-config', (req, res) => {
    const { host, port, user, pass, from } = req.body;
    if (host) runtimeSmtpConfig.host = host.trim();
    if (port) runtimeSmtpConfig.port = parseInt(port);
    if (user) runtimeSmtpConfig.user = user.trim();
    if (pass) runtimeSmtpConfig.pass = pass.trim();
    if (from) runtimeSmtpConfig.from = from.trim();

    res.json({
      success: true,
      message: 'SMTP settings updated successfully',
      configured: Boolean(runtimeSmtpConfig.host && runtimeSmtpConfig.user && runtimeSmtpConfig.pass)
    });
  });

  // API endpoint: Send OTP Email
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email, otp, purpose, name } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email address and OTP code are required' 
        });
      }

      const isForgot = purpose === 'forgot';
      const subject = isForgot 
        ? `ScaleUp Portal - Password Reset Code: ${otp}`
        : `ScaleUp Portal - Email Verification Code: ${otp}`;

      const title = isForgot ? 'Password Reset Verification' : 'Email Verification Code';
      const greeting = name ? `Hello ${name},` : 'Hello,';
      const intro = isForgot
        ? 'You have requested to reset your password for your ScaleUp Portal account. Please use the verification code below to complete the reset process:'
        : 'Thank you for registering an account on ScaleUp Portal. Please use the verification code below to verify your email address:';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080a0f; color: #e2e8f0; margin: 0; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #0f1420; border: 1px solid #1e283b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; text-align: center; border-bottom: 1px solid #243046;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f59e0b; letter-spacing: -0.5px;">ScaleUp Portal</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">${title}</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 28px 24px;">
              <p style="font-size: 14px; color: #f8fafc; font-weight: 600; margin-top: 0;">${greeting}</p>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                ${intro}
              </p>
              
              <!-- OTP Box -->
              <div style="background: #090c13; border: 1.5px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
                <span style="font-family: monospace, Courier, sans-serif; font-size: 36px; font-weight: 900; color: #fbbf24; letter-spacing: 8px; display: inline-block;">${otp}</span>
              </div>
              
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; margin-top: 20px;">
                This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #090c13; padding: 16px; text-align: center; border-top: 1px solid #1a2333;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} ScaleUp Agency Portal • Automated Security Dispatch
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const transporter = await getTransporter();
      if (!transporter) {
        return res.status(500).json({
          success: false,
          error: 'No email dispatch transport available'
        });
      }

      const senderEmail = runtimeSmtpConfig.from || process.env.SMTP_FROM || (runtimeSmtpConfig.user || process.env.SMTP_USER || 'no-reply@scaleup.com');
      const senderString = senderEmail.includes('<') ? senderEmail : `"ScaleUp Security" <${senderEmail}>`;

      const info = await transporter.sendMail({
        from: senderString,
        to: email,
        subject,
        html: htmlContent,
        text: `${greeting}\n\n${intro}\n\nYour OTP Code: ${otp}\n\nThis code expires in 10 minutes.\nScaleUp Portal Security`
      });

      console.log(`[Email Dispatch] OTP sent to ${email}, messageId: ${info.messageId}`);
      
      const testPreview = nodemailer.getTestMessageUrl(info);

      return res.json({
        success: true,
        message: 'OTP has been dispatched to your email address',
        messageId: info.messageId,
        previewUrl: testPreview || undefined
      });
    } catch (err: any) {
      console.error('[Email Dispatch Error]', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to dispatch email'
      });
    }
  });

  // Mount Vite middleware for dev or serve dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
