import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
