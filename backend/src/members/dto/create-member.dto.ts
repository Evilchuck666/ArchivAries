import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MemberStatus } from '../../common/enums/member-status.enum';
import { Role } from '../../common/enums/role.enum';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  discordHandle?: string;

  @IsOptional()
  @IsString()
  rank?: string;
}
