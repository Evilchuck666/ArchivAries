import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
