import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { EventsService } from '../events/events.service';
import { NewsService } from '../news/news.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
    private newsService: NewsService,
    private documentsService: DocumentsService,
  ) {}

  async getDashboard(userId: string, role: Role) {
    const [upcomingEvents, importantNews, recentDocuments] = await Promise.all([
      this.eventsService.findUpcoming(3),
      this.newsService.findImportant(),
      this.documentsService.findRecent(role, 5),
    ]);

    const myParticipations =
      upcomingEvents.length > 0
        ? await this.prisma.eventParticipation.findMany({
            where: {
              userId,
              eventId: { in: upcomingEvents.map((e: any) => e.id) },
            },
            select: { eventId: true, status: true },
          })
        : [];

    return {
      upcomingEvents,
      importantNews,
      recentDocuments,
      myParticipations,
    };
  }
}
