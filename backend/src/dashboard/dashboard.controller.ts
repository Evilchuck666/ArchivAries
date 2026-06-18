import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @RequiresPermission('members.read')
  getDashboard(@CurrentUser() user: { id: string; role: Role }) {
    return this.dashboardService.getDashboard(user.id, user.role);
  }
}
