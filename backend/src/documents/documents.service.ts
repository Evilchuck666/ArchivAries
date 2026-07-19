import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  findAllCategories() {
    return this.prisma.documentCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { documents: true } } },
    });
  }

  createCategory(dto: CreateDocumentCategoryDto) {
    return this.prisma.documentCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: Partial<CreateDocumentCategoryDto>) {
    await this.prisma.documentCategory.findUniqueOrThrow({ where: { id } });
    return this.prisma.documentCategory.update({ where: { id }, data: dto });
  }

  async findAll(viewerRole: string, categoryId?: string, search?: string) {
    const canReadRestricted = await this.permissionsService.hasPermission(viewerRole, 'documents.read_restricted');
    const canSeeDrafts = await this.permissionsService.hasPermission(viewerRole, 'documents.edit');
    const where: any = canSeeDrafts ? {} : { isPublished: true };

    if (!canReadRestricted) where.visibility = 'ALL_MEMBERS';
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        visibility: true,
        isPinned: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        creator: { select: { member: { select: { displayName: true } } } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findRecent(viewerRole: string, limit = 5) {
    const canReadRestricted = await this.permissionsService.hasPermission(viewerRole, 'documents.read_restricted');
    const where: any = { isPublished: true };
    if (!canReadRestricted) where.visibility = 'ALL_MEMBERS';

    return this.prisma.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string, viewerRole: string) {
    const canReadRestricted = await this.permissionsService.hasPermission(viewerRole, 'documents.read_restricted');
    const canSeeDrafts = await this.permissionsService.hasPermission(viewerRole, 'documents.edit');
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        creator: { select: { member: { select: { displayName: true } } } },
      },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (!doc.isPublished && !canSeeDrafts) throw new ForbiddenException();
    if (doc.visibility === 'RESTRICTED' && !canReadRestricted) throw new ForbiddenException();

    return doc;
  }

  create(dto: CreateDocumentDto, creatorId: string) {
    return this.prisma.document.create({
      data: { ...dto, creatorId },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.prisma.document.findUniqueOrThrow({ where: { id } });
    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return this.prisma.document.delete({ where: { id } });
  }
}
