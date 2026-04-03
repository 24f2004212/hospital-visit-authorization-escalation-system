import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const requests = await this.prisma.visitRequest.findMany({
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => this.formatRequest(r));
  }

  async findByStudent(studentId: string) {
    const requests = await this.prisma.visitRequest.findMany({
      where: { studentId },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((r) => this.formatRequest(r));
  }

  async create(data: {
    studentId: string;
    reason: string;
    description?: string;
    urgency: string;
    preferredDate?: string;
    preferredTime?: string;
    hospitalName?: string;
  }) {
    const isEmergency = data.urgency === 'emergency';

    const request = await this.prisma.visitRequest.create({
      data: {
        studentId: data.studentId,
        reason: data.reason + (data.description ? ` — ${data.description}` : ''),
        urgency: data.urgency === 'emergency' ? 'EMERGENCY' : 'NORMAL',
        status: isEmergency ? 'APPROVED' : 'PENDING',
      },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });

    return this.formatRequest(request);
  }

  async approve(id: string, wardenId: string, guardId?: string) {
    const request = await this.prisma.visitRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        wardenId,
        guardId: guardId || null,
        updatedAt: new Date(),
      },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });
    return this.formatRequest(request);
  }

  async reject(id: string, wardenId: string, reason: string) {
    const request = await this.prisma.visitRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        wardenId,
        updatedAt: new Date(),
      },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });
    return { ...this.formatRequest(request), rejectionReason: reason };
  }

  async escalate(id: string, userId?: string) {
    await this.prisma.escalationLog.create({
      data: {
        visitRequestId: id,
        type: 'DELAYED_APPROVAL',
      },
    });

    const request = await this.prisma.visitRequest.update({
      where: { id },
      data: {
        status: 'ESCALATED',
        updatedAt: new Date(),
      },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });
    return this.formatRequest(request);
  }

  async updateTracking(id: string, trackingStatus: string) {
    const statusMap: Record<string, string> = {
      completed: 'COMPLETED',
      preparing: 'APPROVED',
      departed: 'ACTIVE',
      at_hospital: 'ACTIVE',
      returning: 'ACTIVE',
    };
    const dbStatus = statusMap[trackingStatus] || 'ACTIVE';

    const updateData: any = {
      status: dbStatus as any,
      updatedAt: new Date(),
    };
    if (trackingStatus === 'departed') {
      updateData.departureTime = new Date();
    }
    if (trackingStatus === 'completed') {
      updateData.returnTime = new Date();
    }

    const request = await this.prisma.visitRequest.update({
      where: { id },
      data: updateData,
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });
    return { ...this.formatRequest(request), trackingStatus };
  }

  // ---- Guards list ----
  async getGuards() {
    const guards = await this.prisma.user.findMany({
      where: { role: 'GUARD' },
    });
    const activeAssignments = await this.prisma.visitRequest.findMany({
      where: {
        guardId: { not: null },
        status: { in: ['APPROVED', 'ACTIVE'] },
      },
      select: { guardId: true },
    });
    const assignedGuardIds = new Set(activeAssignments.map((a) => a.guardId));

    return guards.map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phoneNumber || '',
      status: assignedGuardIds.has(g.id) ? 'assigned' : 'available',
    }));
  }

  // ---- Feedback ----
  async getFeedback() {
    const feedbacks = await this.prisma.feedback.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
    return feedbacks.map((f) => ({
      id: f.id,
      requestId: f.visitRequestId,
      studentId: f.studentId,
      studentName: f.student?.name || '',
      rating: f.rating,
      hospitalExperience: f.comments || '',
      guardBehavior: '',
      suggestions: '',
      createdAt: f.createdAt.toISOString(),
    }));
  }

  async submitFeedback(data: {
    requestId: string;
    studentId: string;
    studentName?: string;
    rating: number;
    hospitalExperience?: string;
    guardBehavior?: string;
    suggestions?: string;
  }) {
    const fb = await this.prisma.feedback.create({
      data: {
        visitRequestId: data.requestId,
        studentId: data.studentId,
        rating: data.rating,
        comments: [data.hospitalExperience, data.guardBehavior, data.suggestions]
          .filter(Boolean)
          .join(' | '),
      },
      include: { student: true },
    });
    return {
      id: fb.id,
      requestId: fb.visitRequestId,
      studentId: fb.studentId,
      studentName: fb.student?.name || data.studentName || '',
      rating: fb.rating,
      hospitalExperience: data.hospitalExperience || '',
      guardBehavior: data.guardBehavior || '',
      suggestions: data.suggestions || '',
      createdAt: fb.createdAt.toISOString(),
    };
  }

  // ---- Helpers ----
  private formatRequest(r: any) {
    return {
      id: r.id,
      studentId: r.studentId,
      studentName: r.student?.name || '',
      studentEmail: r.student?.email || '',
      hostelBlock: '',
      roomNumber: r.student?.roomNumber || '',
      contactNumber: r.student?.phoneNumber || '',
      reason: r.reason,
      description: r.reason,
      urgency: r.urgency?.toLowerCase() || 'normal',
      preferredDate: r.departureTime ? r.departureTime.toISOString().split('T')[0] : '',
      preferredTime: '',
      hospitalName: '',
      status: r.status?.toLowerCase() || 'pending',
      assignedGuard: r.guardId || null,
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      approvedBy: r.warden
        ? r.warden.name
        : r.urgency === 'EMERGENCY' && r.status !== 'PENDING'
          ? 'Auto-approved (Emergency)'
          : null,
      approvedAt:
        r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'ACTIVE'
          ? r.updatedAt?.toISOString()
          : null,
      rejectionReason: null,
      trackingStatus: this.getTrackingStatus(r),
      escalated: r.status === 'ESCALATED' || (r.escalations && r.escalations.length > 0),
      escalatedAt: r.escalations?.[0]?.createdAt?.toISOString() || null,
      escalatedTo: r.escalations?.length > 0 ? 'Proctor' : null,
      parentNotified: r.urgency === 'EMERGENCY' || (r.escalations && r.escalations.length > 0),
      completedAt: r.status === 'COMPLETED' ? r.updatedAt?.toISOString() : null,
    };
  }

  private getTrackingStatus(r: any): string | null {
    if (r.status === 'PENDING' || r.status === 'REJECTED') return null;
    if (r.status === 'COMPLETED') return 'completed';
    if (r.status === 'ACTIVE') return 'at_hospital';
    if (r.status === 'APPROVED') return 'preparing';
    if (r.status === 'ESCALATED') return 'preparing';
    return null;
  }
}
