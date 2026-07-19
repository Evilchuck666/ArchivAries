import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurgeService {
  private readonly logger = new Logger(PurgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 3 * * *')
  async purgeOldSoftDeleted() {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    this.logger.log(`Purging records soft-deleted before ${cutoff.toISOString()}`);

    // Records with deletedAt already set are let through the middleware as hard deletes
    const results = await Promise.all([
      this.prisma.eventParticipation.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.event.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.document.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.newsAnnouncement.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.loreEntry.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.documentCategory.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.rolePermission.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.roleDefinition.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.member.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
      this.prisma.user.deleteMany({ where: { deletedAt: { lte: cutoff, not: null } } }),
    ]);

    const total = results.reduce((sum, r) => sum + r.count, 0);
    this.logger.log(`Purge complete: ${total} records permanently deleted`);
  }
}
