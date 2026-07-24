import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TRASH_TTL_DAYS = 30;

type TrashTableName = 'events' | 'documents' | 'news_announcements' | 'lore_entries';

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async softDelete(
    tableName: TrashTableName,
    recordId: string,
    title: string,
    deletedById: string,
    ttlDays = TRASH_TTL_DAYS,
  ) {
    const existing = await this.prisma.trashEntry.findUnique({
      where: { tableName_recordId: { tableName, recordId } },
    });
    if (existing) throw new ConflictException('El registro ya está en la papelera');

    const deletedAt = new Date();
    const expiresAt = new Date(deletedAt);
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    return this.prisma.trashEntry.create({
      data: { tableName, recordId, title, deletedById, deletedAt, expiresAt },
    });
  }

  async isInTrash(tableName: TrashTableName, recordId: string): Promise<boolean> {
    const entry = await this.prisma.trashEntry.findUnique({
      where: { tableName_recordId: { tableName, recordId } },
    });
    return !!entry;
  }

  async getTrashedIds(tableName: TrashTableName): Promise<string[]> {
    const entries = await this.prisma.trashEntry.findMany({
      where: { tableName },
      select: { recordId: true },
    });
    return entries.map((e) => e.recordId);
  }

  async restore(trashId: string) {
    const entry = await this.prisma.trashEntry.findUnique({ where: { id: trashId } });
    if (!entry) throw new NotFoundException('Elemento no encontrado en la papelera');
    await this.prisma.trashEntry.delete({ where: { id: trashId } });
    return { restored: true };
  }

  async permanentDelete(trashId: string) {
    const entry = await this.prisma.trashEntry.findUnique({ where: { id: trashId } });
    if (!entry) throw new NotFoundException('Elemento no encontrado en la papelera');
    try {
      await this.hardDeleteRecord(entry.tableName as TrashTableName, entry.recordId);
    } catch {
      // El registro original puede haber sido eliminado manualmente
    }
    await this.prisma.trashEntry.delete({ where: { id: trashId } });
    return { deleted: true };
  }

  async findAll(tableName?: string, page = 1, limit = 20) {
    const where = tableName ? { tableName } : {};
    const [items, total] = await Promise.all([
      this.prisma.trashEntry.findMany({
        where,
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          deletedBy: { select: { member: { select: { displayName: true } } } },
        },
      }),
      this.prisma.trashEntry.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async purgeExpired() {
    const expired = await this.prisma.trashEntry.findMany({
      where: { expiresAt: { lt: new Date() } },
    });
    for (const entry of expired) {
      try {
        await this.hardDeleteRecord(entry.tableName as TrashTableName, entry.recordId);
      } catch {
        // El registro original puede haber sido eliminado manualmente
      }
      await this.prisma.trashEntry.delete({ where: { id: entry.id } });
    }
    return { purged: expired.length };
  }

  private async hardDeleteRecord(tableName: TrashTableName, recordId: string): Promise<void> {
    const deleters: Record<TrashTableName, () => Promise<unknown>> = {
      events: () => this.prisma.event.delete({ where: { id: recordId } }),
      documents: () => this.prisma.document.delete({ where: { id: recordId } }),
      news_announcements: () => this.prisma.newsAnnouncement.delete({ where: { id: recordId } }),
      lore_entries: () => this.prisma.loreEntry.delete({ where: { id: recordId } }),
    };
    await deleters[tableName]();
  }
}
