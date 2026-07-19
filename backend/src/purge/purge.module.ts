import { Module } from '@nestjs/common';
import { PurgeService } from './purge.service';

@Module({
  providers: [PurgeService],
})
export class PurgeModule {}
