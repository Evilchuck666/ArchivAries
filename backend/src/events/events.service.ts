import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '../common/enums/role.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ParticipationDto } from './dto/participation.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    isPublic?: boolean;
  }, userId?: string, viewerRole?: Role) {
    const canSeeDrafts = viewerRole
      ? await this.permissionsService.hasPermission(viewerRole, 'events.edit')
      : false;
    const where: any = {};
    if (!canSeeDrafts) where.isPublished = true;
    if (filters.status) where.status = filters.status;
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.dateFrom || filters.dateTo) {
      where.startDate = {};
      if (filters.dateFrom) where.startDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.startDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
        _count: { select: { participations: true } },
        ...(userId && {
          participations: {
            where: { userId },
            select: { status: true },
            take: 1,
          },
        }),
      },
    });
  }

  findUpcoming(limit = 5) {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        isPublished: true,
        status: { not: 'CANCELLED' },
        OR: [
          { startDate: { gte: now } },
          { startDate: { lt: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        _count: { select: { participations: true } },
      },
    });
  }

  findPublic() {
    return this.prisma.event.findMany({
      where: { isPublic: true, isPublished: true },
      orderBy: { startDate: 'asc' },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
        _count: { select: { participations: true } },
      },
    });
  }

  async findOne(id: string, userId?: string, viewerRole?: Role) {
    const canSeeDrafts = viewerRole
      ? await this.permissionsService.hasPermission(viewerRole, 'events.edit')
      : false;
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
        _count: { select: { participations: true } },
        ...(userId && {
          participations: {
            where: { userId },
            select: { status: true },
            take: 1,
          },
        }),
      },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    if (!event.isPublished && !canSeeDrafts) throw new ForbiddenException();
    return event;
  }

  create(dto: CreateEventDto, creatorId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        creatorId,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto, viewerRole?: Role) {
    await this.findOne(id, undefined, viewerRole);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async participate(eventId: string, userId: string, dto: ParticipationDto) {
    await this.findOne(eventId);
    return this.prisma.eventParticipation.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: {
        eventId,
        userId,
        ...dto,
        confirmedAt: dto.status === 'CONFIRMED' ? new Date() : null,
      },
      update: {
        ...dto,
        confirmedAt: dto.status === 'CONFIRMED' ? new Date() : null,
      },
    });
  }

  async getParticipants(eventId: string) {
    await this.findOne(eventId);

    return this.prisma.eventParticipation.findMany({
      where: { eventId },
      select: {
        status: true,
        role: true,
        notes: true,
        confirmedAt: true,
        user: {
          select: {
            member: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async getUserParticipation(eventId: string, userId: string) {
    return this.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }
}
