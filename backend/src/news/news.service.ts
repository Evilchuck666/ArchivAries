import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(page = 1, limit = 10, viewerRole?: string) {
    const canSeeDrafts = viewerRole
      ? await this.permissionsService.hasPermission(viewerRole, 'news.edit')
      : false;

    return this.prisma.newsAnnouncement.findMany({
      where: canSeeDrafts ? {} : { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        isImportant: true,
        isPublished: true,
        publishedAt: true,
        creator: { select: { member: { select: { displayName: true } } } },
      },
    });
  }

  findImportant() {
    return this.prisma.newsAnnouncement.findMany({
      where: { isPublished: true, isImportant: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
  }

  findRecent(limit = 5) {
    return this.prisma.newsAnnouncement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        isImportant: true,
        publishedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const news = await this.prisma.newsAnnouncement.findUnique({
      where: { id },
      include: {
        creator: { select: { member: { select: { displayName: true } } } },
      },
    });
    if (!news) throw new NotFoundException('Aviso no encontrado');
    return news;
  }

  create(dto: CreateNewsDto, creatorId: string) {
    return this.prisma.newsAnnouncement.create({
      data: { ...dto, creatorId },
    });
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.findOne(id);
    return this.prisma.newsAnnouncement.update({ where: { id }, data: dto });
  }

  async remove(id: string, currentUserId: string, currentUserLevel: number) {
    const news = await this.prisma.newsAnnouncement.findUnique({
      where: { id },
      include: { creator: { select: { role: true } } },
    });
    if (!news) throw new NotFoundException('Aviso no encontrado');
    const allowed = await this.permissionsService.canDelete(
      currentUserId, currentUserLevel, news.creatorId, news.creator.role,
    );
    if (!allowed) throw new ForbiddenException();
    return this.prisma.newsAnnouncement.delete({ where: { id } });
  }
}
