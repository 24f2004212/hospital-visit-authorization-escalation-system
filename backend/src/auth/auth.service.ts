import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.fullName,
        role: (data.role?.toUpperCase() || 'STUDENT') as any,
        phoneNumber: data.contactNumber || '',
        roomNumber: data.roomNumber || '',
        proctorEmail: data.proctorEmail || '',
        parentEmail: data.parentEmail || '',
        parentPhone: data.parentPhone || '',
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role.toLowerCase(),
        hostelBlock: '',
        roomNumber: user.roomNumber || '',
        contactNumber: user.phoneNumber || '',
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
        hostelBlock: '',
        roomNumber: user.roomNumber || '',
        contactNumber: user.phoneNumber || '',
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role.toLowerCase(),
      hostelBlock: '',
      roomNumber: user.roomNumber || '',
      contactNumber: user.phoneNumber || '',
    };
  }
}
