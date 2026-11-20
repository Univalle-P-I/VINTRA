import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
} from 'class-validator';
import { documentType } from '../../common/enums/document-type.enum.js';

/** Public fields required to create an account; status and security fields stay server-managed. */
export class CreateUserDto {
  @IsEnum(documentType)
  documentType!: documentType;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'El documento es obligatorio.' })
  @MaxLength(20)
  documentId!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @MaxLength(254)
  email!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(80)
  firstName!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(80)
  lastName!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

}
