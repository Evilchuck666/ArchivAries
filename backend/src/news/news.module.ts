import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { TrashModule } from '../trash/trash.module';

@Module({
  imports: [PermissionsModule, TrashModule],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
