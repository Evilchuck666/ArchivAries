import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequiresPermission('roles.manage')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequiresPermission('roles.manage')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('roles.manage')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
