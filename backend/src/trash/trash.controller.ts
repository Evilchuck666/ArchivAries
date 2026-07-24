import { Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { TrashService } from './trash.service';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';

@Controller('trash')
export class TrashController {
  constructor(private trashService: TrashService) {}

  @Get()
  @RequiresPermission('trash.read')
  findAll(
    @Query('tableName') tableName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.trashService.findAll(
      tableName,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Delete('purge-expired')
  @RequiresPermission('trash.purge')
  purgeExpired() {
    return this.trashService.purgeExpired();
  }

  @Post(':id/restore')
  @RequiresPermission('trash.restore')
  restore(@Param('id') id: string) {
    return this.trashService.restore(id);
  }

  @Delete(':id')
  @RequiresPermission('trash.purge')
  permanentDelete(@Param('id') id: string) {
    return this.trashService.permanentDelete(id);
  }
}
