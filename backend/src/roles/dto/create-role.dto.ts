import { IsString, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsInt()
  @Min(0)
  @Max(999)
  level: number;

  @IsOptional()
  @IsBoolean()
  isProtected?: boolean;
}
