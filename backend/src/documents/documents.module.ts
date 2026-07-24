import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { TrashModule } from '../trash/trash.module';

@Module({
  imports: [PermissionsModule, TrashModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
