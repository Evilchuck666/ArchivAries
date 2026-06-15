import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive!: boolean;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
