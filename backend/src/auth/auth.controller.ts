import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('seed-root-admin')
  async seedRootAdmin() {
    return this.authService.adminCreateStaff('system', {
      email: 'gharishankarvel@gmail.com',
      passcode: '240806',
      name: 'Super Admin',
      role: 'ADMIN'
    }).catch(e => ({ error: e.message }));
  }

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      fullName: string;
      role: string;
      hostelBlock?: string;
      roomNumber?: string;
      contactNumber?: string;
      proctorEmail?: string;
      parentEmail?: string;
      parentPhone?: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-staff')
  async createStaff(@Request() req: any, @Body() body: { email: string; passcode: string; name: string; role: any }) {
    return this.authService.adminCreateStaff(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  // ── Admin-only: Pending Staff Management ──

  @UseGuards(AuthGuard('jwt'))
  @Get('pending-staff')
  async getPendingStaff(@Request() req: any) {
    this.assertAdmin(req.user);
    return this.authService.getPendingStaff();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('approve-staff/:id')
  async approveStaff(@Param('id') id: string, @Request() req: any) {
    this.assertAdmin(req.user);
    return this.authService.approveStaff(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('reject-staff/:id')
  async rejectStaff(@Param('id') id: string, @Request() req: any) {
    this.assertAdmin(req.user);
    return this.authService.rejectStaff(id);
  }

  private assertAdmin(user: any) {
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can perform this action');
    }
  }
}
