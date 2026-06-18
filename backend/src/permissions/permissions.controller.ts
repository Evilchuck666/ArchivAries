import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
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
  @RequiresPermission('permissions.manage')
  async getAll() {
    return this.permissionsService.getFullMatrix();
  }

  @Patch(':role/:permission')
  @RequiresPermission('permissions.manage')
  async setPermission(
    @Param('role') role: string,
    @Param('permission') permission: string,
    @Body() body: { granted: boolean },
  ) {
    await this.permissionsService.setPermission(role as Role, permission, body.granted);
    return { ok: true };
  }
}
