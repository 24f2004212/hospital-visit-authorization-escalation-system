import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  // The fallback emergency hospitals as requested
  private readonly emergencyHospitals = [
    { name: 'OneHealth Super Speciality Hospital', phone: '+919384635305' },
    { name: 'Annai Arul Hospital', phone: '+919360260915' },
    { name: 'Kathir Memorial Hospital', phone: '+919489230883' },
    { name: 'VIT Chennai Health Centre', phone: '+919345848758' },
  ];

  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private emailService: EmailService,
  ) {}

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
    proctorEmail?: string;
    parentEmail?: string;
    parentPhone?: string;
  }) {
    const isEmergency = data.urgency === 'emergency';

    const request = await this.prisma.visitRequest.create({
      data: {
        studentId: data.studentId,
        reason: data.reason,
        // @ts-ignore
        description: data.description || '',
        urgency: data.urgency === 'emergency' ? 'EMERGENCY' : 'NORMAL',
        status: isEmergency ? 'APPROVED' : 'PENDING',
        // @ts-ignore
        preferredDate: data.preferredDate || '',
        // @ts-ignore
        preferredTime: data.preferredTime || '',
        // @ts-ignore
        hospitalName: data.hospitalName || '',
        // @ts-ignore
        proctorEmail: data.proctorEmail || '',
        // @ts-ignore
        parentEmail: data.parentEmail || '',
        // @ts-ignore
        parentPhone: data.parentPhone || '',
      },
      include: { student: true, warden: true, guard: true, escalations: true, feedbacks: true },
    });

    if (isEmergency) {
      // Immediately notify parents and proctor upon filing an emergency!
      this.logger.warn(`Emergency Request ${request.id} filed! Sending immediate alerts...`);
      await this.dispatchEmergencyAlerts(request, 'An AUTO-APPROVED EMERGENCY request was filed');
    }

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
      departed: 'DEPARTED',
      at_hospital: 'AT_HOSPITAL',
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
        status: { in: ['APPROVED', 'ACTIVE', 'DEPARTED', 'AT_HOSPITAL'] },
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

  // ---- Guard Management (Warden/Admin only) ----
  async createGuard(name: string, phone: string) {
    const bcrypt = await import('bcrypt');
    const dummyPassword = await bcrypt.hash('guard-no-login-' + Date.now(), 10);
    const guard = await this.prisma.user.create({
      data: {
        email: `guard-${Date.now()}@caresync.internal`,
        password: dummyPassword,
        name,
        role: 'GUARD',
        phoneNumber: phone,
        isApproved: true,
      },
    });
    return {
      id: guard.id,
      name: guard.name,
      phone: guard.phoneNumber || '',
      status: 'available',
    };
  }

  async removeGuard(id: string) {
    // Ensure the user is a guard and not currently assigned to an active request
    const guard = await this.prisma.user.findUnique({ where: { id } });
    if (!guard || guard.role !== 'GUARD') {
      throw new Error('Guard not found');
    }
    const activeAssignment = await this.prisma.visitRequest.findFirst({
      where: {
        guardId: id,
        status: { in: ['APPROVED', 'ACTIVE', 'DEPARTED', 'AT_HOSPITAL'] },
      },
    });
    if (activeAssignment) {
      throw new Error('Cannot remove a guard who is currently assigned to an active visit');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: `Guard ${guard.name} has been removed.` };
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
      hostelBlock: r.student?.hostelBlock || '',
      roomNumber: r.student?.roomNumber || '',
      contactNumber: r.student?.phoneNumber || '',
      reason: r.reason,
      description: r.description || '',
      urgency: r.urgency?.toLowerCase() || 'normal',
      preferredDate: r.preferredDate || '',
      preferredTime: r.preferredTime || '',
      hospitalName: r.hospitalName || '',
      proctorEmail: r.proctorEmail || '',
      parentEmail: r.parentEmail || '',
      parentPhone: r.parentPhone || '',
      status: r.status?.toLowerCase() || 'pending',
      assignedGuard: r.guardId || null,
      guardName: r.guard?.name || null,
      wardenName: r.warden?.name || null,
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      approvedBy: r.warden
        ? r.warden.name
        : r.urgency === 'EMERGENCY' && r.status !== 'PENDING'
          ? 'Auto-approved (Emergency)'
          : null,
      approvedAt:
        ['APPROVED', 'COMPLETED', 'ACTIVE', 'DEPARTED', 'AT_HOSPITAL'].includes(r.status)
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
    if (r.status === 'AT_HOSPITAL' || r.status === 'ACTIVE') return 'at_hospital';
    if (r.status === 'DEPARTED') return 'departed';
    if (r.status === 'APPROVED') return 'preparing';
    if (r.status === 'ESCALATED') return 'preparing';
    return null;
  }

  // ---- CRON JOB FOR ESCALATION ----
  @Cron(CronExpression.EVERY_MINUTE)
  async handleEmergencyEscalations() {
    this.logger.debug('Checking for delayed emergency requests...');
    
    // Find requests that are PENDING for more than 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    
    const delayedRequests = await this.prisma.visitRequest.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: threeMinutesAgo,
        },
      },
      include: { student: true },
    });

    for (const request of delayedRequests) {
      this.logger.warn(`Request ${request.id} delayed by > 3 mins. Escaping to hospitals!`);
      
      // Escalate in DB to update status
      await this.escalate(request.id, 'SYSTEM_AUTO_CRON');

      // Dispatch Emails & SMS
      await this.dispatchEmergencyAlerts(request, 'The authorization was delayed, so the system has automatically escalated this');
    }
  }

  // ---- SHARED ALERT DISPATCHER ----
  private async dispatchEmergencyAlerts(req: any, reasonText: string) {
    const studentName = req.student?.name || 'Unknown Student';
    const hospitalList = this.emergencyHospitals.map(h => `- ${h.name}: ${h.phone}`).join('\n');

    const targetParentEmail = req.parentEmail || req.student?.parentEmail;
    if (targetParentEmail) {
      const parentSubject = `Emergency Alert: Immediate Medical Attention Required for ${studentName}`;
      const parentBody = `Dear Parent/Guardian,\n\nWe are reaching out to inform you that your child, ${studentName}, has requested emergency medical authorization at VIT Chennai due to: "${req.reason}".\n\n${reasonText} to ensure immediate safety.\n\nHere are the contact details of nearby emergency hospitals:\n${hospitalList}\n\nA warden and guard are being dispatched. Please try to contact your child's mobile or the campus authorities immediately.`;
      this.logger.log(`Dispatching Parent Alert Email to ${targetParentEmail}`);
      await this.emailService.sendEmail(targetParentEmail, parentSubject, parentBody);
    }

    const targetProctorEmail = req.proctorEmail || req.student?.proctorEmail;
    if (targetProctorEmail) {
      const proctorSubject = `URGENT ACTION REQUIRED: Emergency Authorization for ${studentName}`;
      const proctorBody = `Dear Proctor,\n\nYour student, ${studentName}, filed an "EMERGENCY" visit request for "${req.reason}". \n\n${reasonText}. The system has automatically triggered a Fallback Protocol and alerted the parents.\n\nPlease immediately intervene and check the CareSync Dashboard.`;
      this.logger.log(`Dispatching Proctor Alert Email to ${targetProctorEmail}`);
      await this.emailService.sendEmail(targetProctorEmail, proctorSubject, proctorBody);
    }
  }
}
