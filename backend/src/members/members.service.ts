import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { SYSTEM_ROLE } from '../common/enums/role.enum';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import * as bcrypt from 'bcrypt';

const BASE_PUBLIC = {
  id: true,
  userId: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  status: true,
  rank: true,
  joinedAt: true,
  discordHandle: true,
  user: { select: { role: true } },
};

const PUBLIC_MEMBER_SELECT = {
  ...BASE_PUBLIC,
  realName: true,
  phone: true,
  birthDate: true,
  showPhone: true,
  showBirthDate: true,
};

const SELF_MEMBER_SELECT = {
  ...BASE_PUBLIC,
  realName: true,
  phone: true,
  showPhone: true,
  birthDate: true,
  showBirthDate: true,
  dni: true,
  address: true,
  user: { select: { email: true, role: true, isActive: true } },
};

const ADMIN_MEMBER_SELECT = {
  ...SELF_MEMBER_SELECT,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

function applyPublicVisibility(member: any) {
  const { showPhone, showBirthDate, ...rest } = member;
  return {
    ...rest,
    phone: showPhone ? rest.phone : null,
    birthDate: showBirthDate ? rest.birthDate : null,
  };
}

function normalizeDates(dto: UpdateMemberDto): UpdateMemberDto {
  if (dto.birthDate) {
    return { ...dto, birthDate: new Date(dto.birthDate) as any };
  }
  return dto;
}

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(
    viewerRole: string,
    search?: string,
    status?: string,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { realName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const privileged = await this.permissionsService.hasPermission(viewerRole, 'members.read_sensitive');
    const members = await this.prisma.member.findMany({
      where,
      select: privileged ? ADMIN_MEMBER_SELECT : PUBLIC_MEMBER_SELECT,
      orderBy: { displayName: 'asc' },
    });
    return privileged ? members : members.map(applyPublicVisibility);
  }

  async findOne(id: string, viewerRole: string) {
    const privileged = await this.permissionsService.hasPermission(viewerRole, 'members.read_sensitive');
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: privileged ? ADMIN_MEMBER_SELECT : PUBLIC_MEMBER_SELECT,
    });
    if (!member) throw new NotFoundException('Miembro no encontrado');
    return privileged ? member : applyPublicVisibility(member);
  }

  async findByUserId(userId: string, viewerRole: string) {
    const privileged = await this.permissionsService.hasPermission(viewerRole, 'members.read_sensitive');
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: privileged ? ADMIN_MEMBER_SELECT : SELF_MEMBER_SELECT,
    });
    if (!member) throw new NotFoundException('Perfil no encontrado');
    return member;
  }

  async create(dto: CreateMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: dto.role ?? SYSTEM_ROLE.MEMBER,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          displayName: dto.displayName,
          realName: dto.realName,
          status: dto.status,
          phone: dto.phone,
          discordHandle: dto.discordHandle,
          rank: dto.rank,
        },
        select: ADMIN_MEMBER_SELECT,
      });

      return member;
    });
  }

  async update(id: string, dto: UpdateMemberDto, viewerRole: string) {
    await this.findOne(id, viewerRole);

    const data: any = { ...normalizeDates(dto) };
    const canEditStatus = await this.permissionsService.hasPermission(viewerRole, 'members.edit_status');
    if (!canEditStatus) {
      delete data.status;
      delete data.rank;
    }
    const canEditNotes = await this.permissionsService.hasPermission(viewerRole, 'members.edit_notes');
    if (!canEditNotes) {
      delete data.notes;
    }

    const privileged = await this.permissionsService.hasPermission(viewerRole, 'members.read_sensitive');
    return this.prisma.member.update({
      where: { id },
      data,
      select: privileged ? ADMIN_MEMBER_SELECT : PUBLIC_MEMBER_SELECT,
    });
  }

  async updateNotes(id: string, notes: string, viewerRole: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Miembro no encontrado');
    const privileged = await this.permissionsService.hasPermission(viewerRole, 'members.read_sensitive');
    return this.prisma.member.update({
      where: { id },
      data: { notes },
      select: privileged ? ADMIN_MEMBER_SELECT : PUBLIC_MEMBER_SELECT,
    });
  }

  async updateByUserId(userId: string, dto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Perfil no encontrado');

    const { status, rank, notes, ...allowedFields } = normalizeDates(dto);

    return this.prisma.member.update({
      where: { userId },
      data: allowedFields,
      select: SELF_MEMBER_SELECT,
    });
  }

}
