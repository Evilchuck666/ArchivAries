import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsNotEmpty()
  declare title: string;

  @IsString()
  @IsNotEmpty()
  declare content: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  @IsNotEmpty()
  declare categoryId: string;

  @IsOptional()
  @IsEnum(['ALL_MEMBERS', 'RESTRICTED'])
  visibility?: 'ALL_MEMBERS' | 'RESTRICTED';

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
