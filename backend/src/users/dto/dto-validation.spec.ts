import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ChangePwdDto } from './change-pwd.dto';
import { CreateProfileDto as AssignProfileDto } from './create-profile.dto';
import { CreateUserDto } from './create-user.dto';
import { EditUserInfoDto } from './edit-user-info.dto';
import { selfEditInfo } from './self-edit-info.dto';
import { UserInfoDto } from './user-info.dto';
import { documentType } from '../../common/enums/document-type.enum';
import { roles } from '../../common/enums/roles.enum';
import { userStatus } from '../../common/enums/user-status.enum';
import type { UserAccount } from '../entities/user-account.entity';

describe('DTOs de usuario', () => {
  it('valida las contraseñas actual y nueva con los requisitos de seguridad', () => {
    const dto = plainToInstance(ChangePwdDto, {
      currentPassword: 'Current1!',
      newPassword: 'NewPass1!',
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(validateSync(plainToInstance(ChangePwdDto, { currentPassword: '', newPassword: 'weak' })).length).toBeGreaterThan(0);
  });

  it('valida el UUID y el rol al asignar un perfil', () => {
    const valid = plainToInstance(AssignProfileDto, {
      userAccountId: 'a1b2c3d4-e5f6-47a8-9123-123456789abc',
      userRole: roles.ADMIN,
    });
    expect(validateSync(valid)).toHaveLength(0);
    expect(validateSync(plainToInstance(AssignProfileDto, { userAccountId: 'bad', userRole: 'NOPE' })).length).toBeGreaterThan(0);
  });

  it('normaliza y valida los campos de registro del usuario', () => {
    const dto = plainToInstance(CreateUserDto, {
      documentType: documentType.CEDULA,
      documentId: '  ab-123  ',
      email: '  USER@EXAMPLE.COM ',
      firstName: ' Ada ',
      lastName: ' Lovelace ',
      phone: '123456',
    });
    expect(dto.documentId).toBe('AB-123');
    expect(dto.email).toBe('user@example.com');
    expect(dto.firstName).toBe('Ada');
    expect(dto.lastName).toBe('Lovelace');
    expect(validateSync(dto)).toHaveLength(0);
    expect(validateSync(plainToInstance(CreateUserDto, { ...dto, email: 'invalid' })).length).toBeGreaterThan(0);
  });

  it('acepta cambios parciales y transforma los campos proporcionados', () => {
    const dto = plainToInstance(EditUserInfoDto, {
      firstName: ' Ada ',
      lastName: ' Lovelace ',
      email: ' ADA@EXAMPLE.COM ',
    });
    expect(dto).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });
    expect(validateSync(dto)).toHaveLength(0);
    expect(validateSync(plainToInstance(EditUserInfoDto, { firstName: '   ' })).length).toBeGreaterThan(0);
  });

  it('valida la edición propia y el formato del correo', () => {
    expect(validateSync(plainToInstance(selfEditInfo, { email: 'a@example.com' }))).toHaveLength(0);
    expect(validateSync(plainToInstance(selfEditInfo, { email: 'bad' })).length).toBeGreaterThan(0);
  });

  it('copia los campos expuestos del usuario al DTO de respuesta', () => {
    const source = {
      id: 'user-1', documentType: documentType.CEDULA, documentId: '123',
      firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '555',
      userStatus: userStatus.ACTIVE, emailVerifiedAt: null,
      createdAt: new Date('2025-01-01T00:00:00Z'), updatedAt: new Date('2025-01-02T00:00:00Z'),
      pwdHash: 'secret',
    } as unknown as UserAccount;
    const dto = new UserInfoDto(source);
    expect(dto.email).toBe('ada@example.com');
    expect(dto.userStatus).toBe(userStatus.ACTIVE);
    expect(dto).not.toHaveProperty('pwdHash');
  });
});
