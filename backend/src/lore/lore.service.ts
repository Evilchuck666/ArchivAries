import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '../common/enums/role.enum';
import { CreateLoreEntryDto } from './dto/create-lore-entry.dto';
import { UpdateLoreEntryDto } from './dto/update-lore-entry.dto';

@Injectable()
export class LoreService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(
    viewerRole: Role,
    category?: string,
    tag?: string,
    search?: string,
  ) {
    const [canSeeDrafts, canViewRestricted] = await Promise.all([
      this.permissionsService.hasPermission(viewerRole, 'lore.edit'),
      this.permissionsService.hasPermission(viewerRole, 'lore.view_restricted'),
    ]);

    const where: any = {};
    if (!canSeeDrafts) where.isPublished = true;
    if (!canViewRestricted) where.isRestricted = false;
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.loreEntry.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        isPublished: true,
        isRestricted: true,
        updatedAt: true,
        creator: { select: { member: { select: { displayName: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, viewerRole: Role) {
    const [canSeeDrafts, canViewRestricted] = await Promise.all([
      this.permissionsService.hasPermission(viewerRole, 'lore.edit'),
      this.permissionsService.hasPermission(viewerRole, 'lore.view_restricted'),
    ]);

    const entry = await this.prisma.loreEntry.findUnique({
      where: { id },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
      },
    });
    if (!entry) throw new NotFoundException('Entrada de lore no encontrada');
    if (!entry.isPublished && !canSeeDrafts) throw new NotFoundException('Entrada de lore no encontrada');
    if (entry.isRestricted && !canViewRestricted) throw new NotFoundException('Entrada de lore no encontrada');
    return entry;
  }

  async create(dto: CreateLoreEntryDto, creatorId: string, viewerRole: Role) {
    const canMarkRestricted = await this.permissionsService.hasPermission(viewerRole, 'lore.view_restricted');
    const data: any = { ...dto, category: dto.category as any, creatorId };
    if (!canMarkRestricted) data.isRestricted = false;
    return this.prisma.loreEntry.create({ data });
  }

  async update(id: string, dto: UpdateLoreEntryDto, viewerRole: Role) {
    await this.prisma.loreEntry.findUniqueOrThrow({ where: { id } });
    const canMarkRestricted = await this.permissionsService.hasPermission(viewerRole, 'lore.view_restricted');
    const data: any = { ...dto, category: dto.category as any };
    if (!canMarkRestricted) delete data.isRestricted;
    return this.prisma.loreEntry.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.loreEntry.findUniqueOrThrow({ where: { id } });
    return this.prisma.loreEntry.delete({ where: { id } });
  }
}
