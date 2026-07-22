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
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  @RequiresPermission('news.read')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser('role') role?: string,
  ) {
    return this.newsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      role,
    );
  }

  @Get('important')
  @RequiresPermission('news.read')
  findImportant() {
    return this.newsService.findImportant();
  }

  @Get('recent')
  @RequiresPermission('news.read')
  findRecent(@Query('limit') limit?: string) {
    return this.newsService.findRecent(limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  @RequiresPermission('news.read')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  @RequiresPermission('news.create')
  create(@Body() dto: CreateNewsDto, @CurrentUser('id') userId: string) {
    return this.newsService.create(dto, userId);
  }

  @Patch(':id')
  @RequiresPermission('news.edit')
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @RequiresPermission('news.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('level') userLevel: number,
  ) {
    return this.newsService.remove(id, userId, userLevel);
  }
}
