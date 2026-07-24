import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { TrashModule } from '../trash/trash.module';

@Module({
  imports: [PermissionsModule, TrashModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
