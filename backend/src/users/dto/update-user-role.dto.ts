import { IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  role: string;
}
