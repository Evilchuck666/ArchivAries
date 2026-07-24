import { Module } from '@nestjs/common';
import { LoreService } from './lore.service';
import { LoreController } from './lore.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { TrashModule } from '../trash/trash.module';

@Module({
  imports: [PermissionsModule, TrashModule],
  providers: [LoreService],
  controllers: [LoreController],
  exports: [LoreService],
})
export class LoreModule {}
