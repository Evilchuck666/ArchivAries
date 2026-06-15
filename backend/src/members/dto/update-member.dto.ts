import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MemberStatus } from '../../common/enums/member-status.enum';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsString()
  discordHandle?: string;

  @IsOptional()
  @IsString()
  rank?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  showBirthDate?: boolean;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
