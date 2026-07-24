import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventStatus } from '../common/enums/event-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { TrashService } from '../trash/trash.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ParticipationDto } from './dto/participation.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
    private trashService: TrashService,
  ) {}

  async findAll(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    isPublic?: boolean;
  }, userId?: string, viewerRole?: string) {
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

    const trashedIds = await this.trashService.getTrashedIds('events');
    if (trashedIds.length) where.id = { notIn: trashedIds };

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

  async findUpcoming(limit = 5) {
    const now = new Date();
    const trashedIds = await this.trashService.getTrashedIds('events');
    const where: any = {
      isPublished: true,
      status: { not: 'CANCELLED' },
      OR: [
        { startDate: { gte: now } },
        { startDate: { lt: now }, endDate: { gte: now } },
      ],
    };
    if (trashedIds.length) where.id = { notIn: trashedIds };
    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        _count: { select: { participations: true } },
      },
    });
  }

  async findPublic() {
    const trashedIds = await this.trashService.getTrashedIds('events');
    const where: any = { isPublic: true, isPublished: true };
    if (trashedIds.length) where.id = { notIn: trashedIds };
    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
        _count: { select: { participations: true } },
      },
    });
  }

  async findOne(id: string, userId?: string, viewerRole?: string, currentUserLevel?: number) {
    const canSeeDrafts = viewerRole
      ? await this.permissionsService.hasPermission(viewerRole, 'events.edit')
      : false;
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { role: true, member: { select: { displayName: true } } } },
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
    if (await this.trashService.isInTrash('events', id)) throw new NotFoundException('Evento no encontrado');
    if (!event.isPublished && !canSeeDrafts) throw new ForbiddenException();

    const canDelete =
      viewerRole !== undefined && userId !== undefined && currentUserLevel !== undefined
        ? (await this.permissionsService.hasPermission(viewerRole, 'events.delete')) &&
          (await this.permissionsService.canDelete(userId, currentUserLevel, event.creatorId, event.creator.role))
        : false;

    return { ...event, canDelete };
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

  async update(id: string, dto: UpdateEventDto, viewerRole?: string) {
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

  async remove(id: string, currentUserId: string, currentUserLevel: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { creator: { select: { role: true } } },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    const allowed = await this.permissionsService.canDelete(
      currentUserId, currentUserLevel, event.creatorId, event.creator.role,
    );
    if (!allowed) throw new ForbiddenException();
    return this.trashService.softDelete('events', id, event.title, currentUserId);
  }

  async participate(eventId: string, userId: string, dto: ParticipationDto) {
    const event = await this.findOne(eventId);
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.FINISHED) {
      throw new BadRequestException('No se puede confirmar asistencia a un evento cancelado o finalizado');
    }
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
