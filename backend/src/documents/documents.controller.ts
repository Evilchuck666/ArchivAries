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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto';
import { RequiresPermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('document-categories')
  @RequiresPermission('documents.read')
  getCategories() {
    return this.documentsService.findAllCategories();
  }

  @Post('document-categories')
  @RequiresPermission('documents.manage_categories')
  createCategory(@Body() dto: CreateDocumentCategoryDto) {
    return this.documentsService.createCategory(dto);
  }

  @Patch('document-categories/:id')
  @RequiresPermission('documents.manage_categories')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDocumentCategoryDto>,
  ) {
    return this.documentsService.updateCategory(id, dto);
  }

  @Get('documents')
  @RequiresPermission('documents.read')
  findAll(
    @CurrentUser('role') role: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findAll(role, categoryId, search);
  }

  @Get('documents/recent')
  @RequiresPermission('documents.read')
  findRecent(@CurrentUser('role') role: string, @Query('limit') limit?: string) {
    return this.documentsService.findRecent(role, limit ? parseInt(limit) : 5);
  }

  @Get('documents/:id')
  @RequiresPermission('documents.read')
  findOne(@Param('id') id: string, @CurrentUser('role') role: string) {
    return this.documentsService.findOne(id, role);
  }

  @Post('documents')
  @RequiresPermission('documents.create')
  create(@Body() dto: CreateDocumentDto, @CurrentUser('id') userId: string) {
    return this.documentsService.create(dto, userId);
  }

  @Patch('documents/:id')
  @RequiresPermission('documents.edit')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete('documents/:id')
  @RequiresPermission('documents.delete')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
