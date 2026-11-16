<<<<<<< HEAD
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;
=======
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
>>>>>>> c5c568c7a2a382916753b642c2a63e942d5ee8dd
}