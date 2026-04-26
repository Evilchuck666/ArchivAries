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
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  @Roles(Role.MEMBER)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.newsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('important')
  @Roles(Role.MEMBER)
  findImportant() {
    return this.newsService.findImportant();
  }

  @Get('recent')
  @Roles(Role.MEMBER)
  findRecent(@Query('limit') limit?: string) {
    return this.newsService.findRecent(limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  @Roles(Role.MEMBER)
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  @Roles(Role.AREA_MANAGER)
  create(@Body() dto: CreateNewsDto, @CurrentUser('id') userId: string) {
    return this.newsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.AREA_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
