import { Module } from '@nestjs/common';
import { LoreService } from './lore.service';
import { LoreController } from './lore.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [LoreService],
  controllers: [LoreController],
  exports: [LoreService],
})
export class LoreModule {}
