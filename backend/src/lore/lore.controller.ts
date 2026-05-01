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
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('lore')
export class LoreController {
  constructor(private loreService: LoreService) {}

  @Get()
  @Roles(Role.MEMBER)
  findAll(
    @CurrentUser('role') role: Role,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.loreService.findAll(role, category, tag, search);
  }

  @Get(':id')
  @Roles(Role.MEMBER)
  findOne(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.loreService.findOne(id, role);
  }

  @Post()
  @Roles(Role.CONTENT_MANAGER)
  create(@Body() dto: CreateLoreEntryDto, @CurrentUser('id') userId: string) {
    return this.loreService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.CONTENT_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateLoreEntryDto) {
    return this.loreService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.loreService.remove(id);
  }
}
