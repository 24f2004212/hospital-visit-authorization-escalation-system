import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ---- Auth ----
  @Post('auth/register')
  register(@Body() body: any) {
    return this.appService.register(body);
  }

  @Post('auth/login')
  login(@Body() body: any) {
    return this.appService.login(body);
  }

  // ---- Requests ----
  @Get('requests')
  getRequests() {
    return this.appService.getRequests();
  }

  @Post('requests')
  submitRequest(@Body() body: any) {
    return this.appService.submitRequest(body);
  }

  @Patch('requests/:id/approve')
  approveRequest(@Param('id') id: string, @Body() body: any) {
    return this.appService.approveRequest(id, body);
  }

  @Patch('requests/:id/tracking')
  updateTrackingStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appService.updateTrackingStatus(id, status);
  }

  @Patch('requests/:id/escalate')
  escalateRequest(@Param('id') id: string) {
    return this.appService.escalateRequest(id);
  }

  // ---- Feedback ----
  @Get('feedback')
  getFeedback() {
    return this.appService.getFeedback();
  }

  @Post('feedback')
  submitFeedback(@Body() body: any) {
    return this.appService.submitFeedback(body);
  }

  // ---- Guards ----
  @Get('guards')
  getGuards() {
    return this.appService.getGuards();
  }
}
