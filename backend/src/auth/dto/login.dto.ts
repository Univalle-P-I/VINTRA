import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class LoginDto {
  @IsUUID()
  documentTypeId!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentId!: string;

  // No se valida complejidad al iniciar sesión, solo que exista y tenga un tope de longitud
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}