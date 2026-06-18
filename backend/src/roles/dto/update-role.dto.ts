import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  level?: number;
}
