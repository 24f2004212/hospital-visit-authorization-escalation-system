import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: twilio.Twilio | null = null;
  private readonly fromPhone: string;
  private readonly isMockMode: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

    if (accountSid && authToken && accountSid !== 'mock_sid') {
      this.client = new twilio.Twilio(accountSid, authToken);
      this.isMockMode = false;
      this.logger.log('Twilio SMS Client initialized.');
    } else {
      this.isMockMode = true;
      this.logger.warn('Twilio credentials not found. Running SMS Service in MOCK mode.');
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (this.isMockMode || !this.client) {
      this.logger.log('\n=============================================');
      this.logger.log(`📱 MOCK SMS SENT`);
      this.logger.log(`To: ${to}`);
      this.logger.log(`Message: ${message}`);
      this.logger.log('=============================================\n');
      return true;
    }

    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to,
      });
      this.logger.log(`SMS Sent to ${to} (SID: ${response.sid})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      return false;
    }
  }
}
