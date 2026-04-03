import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  // ---- Auth ----
  async register(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email?.toLowerCase() }
    });
    if (existing) throw new BadRequestException('User already exists');

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password, // Plain text for demo purposes
        name: data.fullName,
        role: data.role || 'STUDENT',
        roomNumber: data.roomNumber,
        phoneNumber: data.contactNumber,
      }
    });
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email?.toLowerCase() }
    });
    if (!user || user.password !== data.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password, ...result } = user;
    return result;
  }

  // ---- Requests ----
  async getRequests() {
    return this.prisma.visitRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
        warden: true,
        guard: true
      }
    });
  }

  async submitRequest(data: any) {
    return this.prisma.visitRequest.create({
      data: {
        studentId: data.studentId,
        reason: data.reason,
        urgency: data.urgency || 'NORMAL',
        status: data.urgency === 'emergency' ? 'APPROVED' : 'PENDING'
      },
      include: { student: true, warden: true, guard: true }
    });
  }

  async approveRequest(id: string, data: any) {
    return this.prisma.visitRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        guardId: data.guardId || null,
        wardenId: data.wardenId || null
      },
      include: { student: true, warden: true, guard: true }
    });
  }

  async updateTrackingStatus(id: string, trackingStatus: string) {
    let internalStatus = 'ACTIVE';
    if (trackingStatus === 'completed') {
      internalStatus = 'COMPLETED';
    }
    
    return this.prisma.visitRequest.update({
      where: { id },
      data: {
        status: internalStatus,
        returnTime: internalStatus === 'COMPLETED' ? new Date() : undefined
      },
      include: { student: true, warden: true, guard: true }
    });
  }

  async escalateRequest(id: string) {
    // Basic escalation 
    return this.prisma.visitRequest.update({
       where: { id },
       data: { status: 'ESCALATED' }
    });
  }

  // ---- Feedback ----
  async getFeedback() {
     return this.prisma.feedback.findMany({
       include: { student: true, visitRequest: true },
       orderBy: { createdAt: 'desc' }
     });
  }

  async submitFeedback(data: any) {
    return this.prisma.feedback.create({
      data: {
        visitRequestId: data.requestId,
        studentId: data.studentId,
        rating: data.rating,
        comments: `Experience: ${data.hospitalExperience} | Guard: ${data.guardBehavior} | Suggestions: ${data.suggestions}`
      }
    });
  }

  // ---- Users/Guards ----
  async getGuards() {
     return this.prisma.user.findMany({
        where: { role: 'GUARD' }
     });
  }
}
