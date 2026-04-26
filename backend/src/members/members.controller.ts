import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @Roles(Role.MEMBER)
  findAll(
    @CurrentUser('role') role: Role,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.membersService.findAll(role, search, status);
  }

  @Get('me')
  @Roles(Role.MEMBER)
  getMe(@CurrentUser() user: { id: string; role: Role }) {
    return this.membersService.findByUserId(user.id, user.role);
  }

  @Get(':id')
  @Roles(Role.MEMBER)
  findOne(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.membersService.findOne(id, role);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Patch('me')
  @Roles(Role.MEMBER)
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateByUserId(userId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser('role') role: Role,
  ) {
    return this.membersService.update(id, dto, role);
  }
}
