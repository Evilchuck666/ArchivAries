import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');

const avatarInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(AVATAR_DIR)) mkdirSync(AVATAR_DIR, { recursive: true });
      cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
      const userId = (req as any).user?.id ?? 'unknown';
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${userId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

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

  @Post('me/avatar')
  @Roles(Role.MEMBER)
  @UseInterceptors(avatarInterceptor)
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Formato no válido o archivo ausente');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.membersService.updateByUserId(userId, { avatarUrl });
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
