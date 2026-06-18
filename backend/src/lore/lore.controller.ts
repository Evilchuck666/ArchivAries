import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { LoreService } from './lore.service';
import { CreateLoreEntryDto } from './dto/create-lore-entry.dto';
import { UpdateLoreEntryDto } from './dto/update-lore-entry.dto';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('lore')
export class LoreController {
  constructor(private loreService: LoreService) {}

  @Get()
  @RequiresPermission('lore.read')
  findAll(
    @CurrentUser('role') role: Role,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.loreService.findAll(role, category, tag, search);
  }

  @Get(':id')
  @RequiresPermission('lore.read')
  findOne(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.loreService.findOne(id, role);
  }

  @Post()
  @RequiresPermission('lore.create')
  create(
    @Body() dto: CreateLoreEntryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.loreService.create(dto, userId, role);
  }

  @Patch(':id')
  @RequiresPermission('lore.edit')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLoreEntryDto,
    @CurrentUser('role') role: Role,
  ) {
    return this.loreService.update(id, dto, role);
  }

  @Delete(':id')
  @RequiresPermission('lore.delete')
  remove(@Param('id') id: string) {
    return this.loreService.remove(id);
  }
}
