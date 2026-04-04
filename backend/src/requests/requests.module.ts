import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService, SmsService, EmailService],
})
export class RequestsModule {}
