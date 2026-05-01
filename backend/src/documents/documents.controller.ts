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
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('document-categories')
  @Roles(Role.MEMBER)
  getCategories() {
    return this.documentsService.findAllCategories();
  }

  @Post('document-categories')
  @Roles(Role.ADMIN)
  createCategory(@Body() dto: CreateDocumentCategoryDto) {
    return this.documentsService.createCategory(dto);
  }

  @Patch('document-categories/:id')
  @Roles(Role.ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDocumentCategoryDto>,
  ) {
    return this.documentsService.updateCategory(id, dto);
  }

  @Get('documents')
  @Roles(Role.MEMBER)
  findAll(
    @CurrentUser('role') role: Role,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findAll(role, categoryId, search);
  }

  @Get('documents/recent')
  @Roles(Role.MEMBER)
  findRecent(@CurrentUser('role') role: Role, @Query('limit') limit?: string) {
    return this.documentsService.findRecent(role, limit ? parseInt(limit) : 5);
  }

  @Get('documents/:id')
  @Roles(Role.MEMBER)
  findOne(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.documentsService.findOne(id, role);
  }

  @Post('documents')
  @Roles(Role.CONTENT_MANAGER)
  create(@Body() dto: CreateDocumentDto, @CurrentUser('id') userId: string) {
    return this.documentsService.create(dto, userId);
  }

  @Patch('documents/:id')
  @Roles(Role.CONTENT_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete('documents/:id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
