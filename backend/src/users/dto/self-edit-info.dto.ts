import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
} from 'class-validator'

export class selfEditInfo{

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @MaxLength(254)
  email?: string;

  @IsString()
  @MaxLength(20)
  phone?: string;

}