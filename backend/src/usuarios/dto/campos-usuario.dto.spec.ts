import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ActualizarConductorDto } from '../../personal/dto/actualizar-conductor.dto';
import { CrearConductorDto } from '../../personal/dto/crear-conductor.dto';
import { RolUsuario } from '../../perfiles/entidades/perfil.entity';
import { TipoDocumento } from '../entidades/cuenta-usuario.entity';
import { ActualizarDatosUsuarioDto } from './actualizar-datos-usuario.dto';
import { CrearUsuarioInternoDto } from './crear-usuario-interno.dto';

describe('shared user DTO fields', () => {
  it('keeps create-field transformations and validation in both DTOs', () => {
    const conductor = plainToInstance(CrearConductorDto, {
      documentType: TipoDocumento.CC,
      documentId: ' 1234567890 ',
      firstName: ' Ana ',
      lastName: ' Pérez ',
      email: ' ANA@EXAMPLE.COM ',
      password: 'a-secure-password',
    });
    const usuario = plainToInstance(CrearUsuarioInternoDto, {
      documentType: TipoDocumento.CC,
      documentId: ' 1234567890 ',
      firstName: ' Ana ',
      lastName: ' Pérez ',
      email: ' ANA@EXAMPLE.COM ',
      role: RolUsuario.ADMIN,
      password: 'a-secure-password',
    });

    expect(conductor.firstName).toBe('Ana');
    expect(conductor.email).toBe('ana@example.com');
    expect(conductor.documentId).toBe(' 1234567890 ');
    expect(validateSync(conductor)).toEqual([]);
    expect(usuario.firstName).toBe('Ana');
    expect(usuario.email).toBe('ana@example.com');
    expect(usuario.documentId).toBe('1234567890');
    expect(validateSync(usuario)).toEqual([]);
  });

  it('keeps update-field transformations and validation in both DTOs', () => {
    const conductor = plainToInstance(ActualizarConductorDto, {
      firstName: ' Ana ',
      email: ' ANA@EXAMPLE.COM ',
      phone: null,
    });
    const usuario = plainToInstance(ActualizarDatosUsuarioDto, {
      lastName: ' Pérez ',
      email: ' ANA@EXAMPLE.COM ',
    });
    const invalidUsuario = plainToInstance(ActualizarDatosUsuarioDto, {
      firstName: 'A',
    });

    expect(conductor.firstName).toBe('Ana');
    expect(conductor.email).toBe('ana@example.com');
    expect(conductor.phone).toBeNull();
    expect(validateSync(conductor)).toEqual([]);
    expect(usuario.lastName).toBe('Pérez');
    expect(usuario.email).toBe('ana@example.com');
    expect(validateSync(usuario)).toEqual([]);
    expect(
      validateSync(invalidUsuario).map(({ property }) => property),
    ).toContain('firstName');
  });
});
