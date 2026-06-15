import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('me')
  async getMyPermissions(@CurrentUser('role') role: Role) {
    return this.permissionsService.getPermissionsForRole(role);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAll() {
    return this.permissionsService.getFullMatrix();
  }

  @Patch(':role/:permission')
  @Roles(Role.ADMIN)
  async setPermission(
    @Param('role') role: string,
    @Param('permission') permission: string,
    @Body() body: { granted: boolean },
  ) {
    await this.permissionsService.setPermission(role as Role, permission, body.granted);
    return { ok: true };
  }
}
