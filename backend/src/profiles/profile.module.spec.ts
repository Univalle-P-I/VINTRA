import { MODULE_METADATA } from '@nestjs/common/constants';
import { ProfileModule } from './profile.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileModule', () => {
  it('registra el controlador, el servicio y el repositorio de perfiles', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ProfileModule)).toContain(ProfileController);
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ProfileModule)).toContain(ProfileService);
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, ProfileModule)).toHaveLength(1);
  });
});
