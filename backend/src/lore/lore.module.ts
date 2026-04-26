import { Module } from '@nestjs/common';
import { LoreService } from './lore.service';
import { LoreController } from './lore.controller';

@Module({
  providers: [LoreService],
  controllers: [LoreController],
  exports: [LoreService],
})
export class LoreModule {}
