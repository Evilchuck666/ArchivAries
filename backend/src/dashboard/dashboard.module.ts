import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { EventsModule } from '../events/events.module';
import { NewsModule } from '../news/news.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [EventsModule, NewsModule, DocumentsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
