import { IsString, MinLength } from 'class-validator';

export class ActivateDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(1)
  displayName: string;

  @IsString()
  @MinLength(8)
  password: string;
}
