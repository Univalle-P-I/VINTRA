import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { roles } from '../../common/enums/roles.enum.js';

export class CreateProfileDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsEnum(roles)
  userRole!: roles;
}
