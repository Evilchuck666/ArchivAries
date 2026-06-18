import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivateDto } from './dto/activate.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: { id: string; email: string; role: string }) {
    return this.authService.refresh(user.id, user.email, user.role);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('verify-password')
  @RequiresPermission('members.edit_own')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyPassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
  ) {
    return this.authService.verifyPassword(userId, currentPassword);
  }

  @Patch('password')
  @RequiresPermission('members.edit_own')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Public()
  @Get('invite/validate')
  validateInvite(@Query('token') token: string) {
    return this.authService.validateInviteToken(token);
  }

  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  activate(@Body() dto: ActivateDto) {
    return this.authService.activate(dto);
  }
}
