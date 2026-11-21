import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class ResetPwdDto {
  // Token de recuperación recibido por el usuario
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo',
    },
  )
  @MaxLength(128)
  newPassword!: string;
}