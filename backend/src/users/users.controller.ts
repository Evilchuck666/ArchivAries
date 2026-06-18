import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequiresPermission('users.manage')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequiresPermission('users.manage')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @RequiresPermission('users.edit_role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Patch(':id/status')
  @RequiresPermission('users.manage')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @Post('invite')
  @RequiresPermission('users.manage')
  invite(@Body() dto: InviteUserDto) {
    return this.usersService.invite(dto);
  }
}
