import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        member: { select: { displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        member: { select: { displayName: true, avatarUrl: true, status: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === Role.SUPER_ADMIN && dto.role !== Role.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN, isActive: true },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException(
          'No se puede degradar al único Super-Administrador activo.',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, email: true, role: true },
    });
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === Role.SUPER_ADMIN && !dto.isActive) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN, isActive: true },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException(
          'No se puede desactivar al único Super-Administrador activo.',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: { id: true, email: true, isActive: true },
    });

    await this.prisma.member.updateMany({
      where: { userId: id },
      data: { notes: dto.reason },
    });

    return updated;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async invite(dto: InviteUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está en uso');

    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const expiresHours = this.config.get<number>('smtp.inviteExpiresHours') ?? 72;
    const inviteExpiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: '',
        isActive: false,
        role: dto.role ?? Role.MEMBER,
        inviteToken: tokenHash,
        inviteExpiresAt,
      },
      select: { id: true, email: true, role: true },
    });

    const appUrl = this.config.get<string>('app.url') ?? 'http://localhost:5173';
    const activationUrl = `${appUrl}/activate?token=${plainToken}`;

    await this.mail.sendInvite(dto.email, activationUrl, expiresHours);

    return { ...user, devActivationUrl: activationUrl };
  }
}
