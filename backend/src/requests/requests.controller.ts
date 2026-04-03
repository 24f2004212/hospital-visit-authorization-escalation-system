import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Get all requests (for wardens/admins)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.requestsService.findAll();
  }

  // Get requests for the logged-in student
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async findMine(@Request() req: any) {
    return this.requestsService.findByStudent(req.user.id);
  }

  // Submit a new request
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    try {
      return await this.requestsService.create({
        ...body,
        studentId: req.user.id,
        // Use provided body fields or default to user profile values
        proctorEmail: body.proctorEmail || req.user.proctorEmail,
        parentEmail: body.parentEmail || req.user.parentEmail,
        parentPhone: body.parentPhone || req.user.parentPhone,
      });
    } catch (err) {
      console.error("Create request failed:", err);
      throw new InternalServerErrorException(err.message || String(err));
    }
  }

  // Approve a request
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { guardId?: string },
  ) {
    return this.requestsService.approve(id, req.user.id, body.guardId);
  }

  // Reject a request
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { reason: string },
  ) {
    return this.requestsService.reject(id, req.user.id, body.reason);
  }

  // Escalate a request
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/escalate')
  async escalate(@Param('id') id: string, @Request() req: any) {
    return this.requestsService.escalate(id, req.user.id);
  }

  // Update tracking status
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/tracking')
  async updateTracking(
    @Param('id') id: string,
    @Body() body: { trackingStatus: string },
  ) {
    return this.requestsService.updateTracking(id, body.trackingStatus);
  }

  // ---- Guards ----
  @UseGuards(AuthGuard('jwt'))
  @Get('guards')
  async getGuards() {
    return this.requestsService.getGuards();
  }

  // ---- Feedback ----
  @UseGuards(AuthGuard('jwt'))
  @Get('feedback')
  async getFeedback() {
    return this.requestsService.getFeedback();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('feedback')
  async submitFeedback(@Request() req: any, @Body() body: any) {
    return this.requestsService.submitFeedback({
      ...body,
      studentId: req.user.id,
      studentName: req.user.fullName,
    });
  }
}
