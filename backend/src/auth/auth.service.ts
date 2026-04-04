import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private prisma: any;
  constructor(
    prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.prisma = prisma;
  }

  async register(data: {
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
  }) {
    const normalizedRole = (data.role?.toUpperCase() || 'STUDENT') as string;

    // Block admin and guard registration — admin is seeded, guards are managed by wardens
    if (normalizedRole === 'ADMIN') {
      throw new ForbiddenException('Admin accounts cannot be registered. Please contact the system administrator.');
    }
    if (normalizedRole === 'GUARD') {
      throw new ForbiddenException('Guard accounts are managed by wardens and cannot be self-registered.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Wardens and Proctors require admin approval
    const needsApproval = ['WARDEN', 'PROCTOR'].includes(normalizedRole);

    let assignedProctorEmail = '';
    let assignedProctorId = null;

    if (normalizedRole === 'STUDENT') {
      const proctors = await this.prisma.proctor.findMany();
      if (proctors.length > 0) {
        const randomProctor = proctors[Math.floor(Math.random() * proctors.length)];
        assignedProctorEmail = randomProctor.email;
        assignedProctorId = randomProctor.id;
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma['user'].create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.fullName,
        role: normalizedRole,
        phoneNumber: data.contactNumber || '',
        roomNumber: data.roomNumber || '',
        hostelBlock: data.hostelBlock || '',
        proctorEmail: assignedProctorEmail,
        proctorId: assignedProctorId,
        parentEmail: data.parentEmail || '',
        parentPhone: data.parentPhone || '',
        isApproved: !needsApproval,
      },
      include: {
        proctor: true
      }
    });

    // If staff needs approval, don't issue a token
    if (needsApproval) {
      return {
        pendingApproval: true,
        message: 'Registration successful! Your account is pending admin approval. You will be able to log in once an administrator approves your account.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          role: user.role.toLowerCase(),
        },
      };
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role.toLowerCase(),
        hostelBlock: user.hostelBlock || '',
        roomNumber: user.roomNumber || '',
        contactNumber: user.phoneNumber || '',
        proctor: user.proctor ? {
          name: user.proctor.name,
          email: user.proctor.email,
          phone: user.proctor.phone
        } : null,
      },
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    console.log(`AUTH DEBUG: Attempting login for: [${normalizedEmail}]`);
    const user = await this.prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      include: { proctor: true }
    });
    if (!user) {
      console.log(`AUTH DEBUG: User NOT FOUND in database: [${email}]`);
      throw new UnauthorizedException('Invalid email or password');
    }
    console.log(`AUTH DEBUG: User found: [${user.email}], Role: [${user.role}], Password length: [${user.password?.length}]`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`AUTH DEBUG: PASSWORD MISMATCH for [${email}]`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is approved
    if (!user.isApproved) {
      console.log(`AUTH DEBUG: ACCOUNT NOT APPROVED for [${email}]`);
      throw new UnauthorizedException('Your account is pending admin approval. Please contact the administrator.');
    }
    console.log(`AUTH DEBUG: LOGIN SUCCESS for [${email}]`);

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role.toLowerCase(),
        hostelBlock: user.hostelBlock || '',
        roomNumber: user.roomNumber || '',
        contactNumber: user.phoneNumber || '',
        proctor: user.proctor ? {
          name: user.proctor.name,
          email: user.proctor.email,
          phone: user.proctor.phone
        } : null,
      },
    };
  }

  async adminCreateStaff(adminId: string, data: {
    email: string;
    passcode: string;
    name: string;
    role: 'ADMIN' | 'WARDEN' | 'GUARD' | 'PROCTOR';
  }) {
    // Check if requester is an admin
    if (adminId !== 'system') {
      const admin = await this.prisma['user'].findUnique({ where: { id: adminId } });
      if (!admin || admin.role !== 'ADMIN') {
        throw new UnauthorizedException('Only administrators can create staff accounts.');
      }
    }

    const existing = await this.prisma['user'].findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Staff account with this email already exists.');
    }

    // Passcode should be exactly 6 digits
    if (!/^\d{6}$/.test(data.passcode)) {
      throw new ConflictException('Passcode must be exactly 6 digits.');
    }

    const hashedPassword = await bcrypt.hash(data.passcode, 10);
    const staff = await this.prisma['user'].create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        phoneNumber: '',
        roomNumber: '',
        isApproved: true,
      },
    });

    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role.toLowerCase(),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { proctor: true }
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role.toLowerCase(),
      hostelBlock: user.hostelBlock || '',
      roomNumber: user.roomNumber || '',
      contactNumber: user.phoneNumber || '',
      proctor: user.proctor ? {
        name: user.proctor.name,
        email: user.proctor.email,
        phone: user.proctor.phone
      } : null,
    };
  }

  // ── Admin Staff Approval Methods ──

  async getPendingStaff() {
    const users = await this.prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role.toLowerCase(),
      phoneNumber: u.phoneNumber || '',
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async approveStaff(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isApproved) throw new ConflictException('User is already approved');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isApproved: true },
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role.toLowerCase(),
      isApproved: updated.isApproved,
      message: `${updated.name} has been approved as ${updated.role.toLowerCase()}.`,
    };
  }

  async rejectStaff(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isApproved) throw new ConflictException('Cannot reject an already approved user');

    await this.prisma.user.delete({ where: { id } });
    return {
      message: `${user.name}'s registration has been rejected and removed.`,
    };
  }
}
