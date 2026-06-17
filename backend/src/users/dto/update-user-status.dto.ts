import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean()
  declare isActive: boolean;

  @IsString()
  @IsNotEmpty()
  declare reason: string;
}
