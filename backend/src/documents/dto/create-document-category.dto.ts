import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDocumentCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
