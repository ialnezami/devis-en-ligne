import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.configService.get<string>('SMTP_HOST', 'localhost'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error.message);
      // Fallback to console logging for development
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL', 'noreply@example.com'),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `
        Password Reset Request
        
        You have requested to reset your password.
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 24 hours.
        If you didn't request this, please ignore this email.
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL', 'noreply@example.com'),
      to: email,
      subject: 'Welcome to Online Quotation Tool',
      html: `
        <h2>Welcome ${firstName}!</h2>
        <p>Thank you for registering with Online Quotation Tool.</p>
        <p>Your account has been created successfully.</p>
        <p>You can now log in and start using our services.</p>
      `,
      text: `
        Welcome ${firstName}!
        
        Thank you for registering with Online Quotation Tool.
        Your account has been created successfully.
        You can now log in and start using our services.
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendAccountActivationEmail(email: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL', 'noreply@example.com'),
      to: email,
      subject: 'Account Activated',
      html: `
        <h2>Account Activated</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been activated successfully.</p>
        <p>You can now log in and access all features.</p>
      `,
      text: `
        Account Activated
        
        Hello ${firstName},
        Your account has been activated successfully.
        You can now log in and access all features.
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendAccountSuspensionEmail(email: string, firstName: string, reason?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL', 'noreply@example.com'),
      to: email,
      subject: 'Account Suspended',
      html: `
        <h2>Account Suspended</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been suspended.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>Please contact support for more information.</p>
      `,
      text: `
        Account Suspended
        
        Hello ${firstName},
        Your account has been suspended.
        ${reason ? `Reason: ${reason}` : ''}
        Please contact support for more information.
      `,
    };

    await this.sendEmail(mailOptions);
  }

  private async sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email sent successfully to ${mailOptions.to}`);
      } else {
        // Fallback to console logging for development
        this.logger.log('Email would be sent (development mode):', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}`, error.message);
      throw error;
    }
  }
}
