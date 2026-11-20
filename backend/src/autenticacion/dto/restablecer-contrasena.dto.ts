import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RestablecerContrasenaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  confirmPassword: string;
}
