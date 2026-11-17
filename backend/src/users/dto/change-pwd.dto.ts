import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

/** Password change requires the current password and the requested replacement. */
export class ChangePwdDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria.' })
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria.' })
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
        'La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.',
    },
  )
  @MaxLength(128)
  newPassword!: string;
}
