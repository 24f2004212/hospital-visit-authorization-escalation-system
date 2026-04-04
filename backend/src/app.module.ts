import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './requests/requests.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RequestsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
