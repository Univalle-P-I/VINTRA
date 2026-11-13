import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidarCorreoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;
}