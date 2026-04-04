import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isMockMode: boolean;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.isMockMode = false;
      this.logger.log('Nodemailer SMTP Client initialized.');
    } else {
      this.isMockMode = true;
      this.logger.warn('SMTP credentials not found. Running Email Service in MOCK mode.');
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (this.isMockMode || !this.transporter) {
      this.logger.log('\n=============================================');
      this.logger.log(`📧 MOCK EMAIL SENT`);
      this.logger.log(`To: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Body:\n${body}`);
      this.logger.log('=============================================\n');
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"CareSync System" <no-reply@caresync.edu>',
        to,
        subject,
        text: body,
      });
      this.logger.log(`Email Sent to ${to} for subject: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }
}
