import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../../common/enums/event-status.enum';

export class ParticipationDto {
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
