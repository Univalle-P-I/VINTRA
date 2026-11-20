import { ProfileController } from './profile.controller';
import type { ProfileService } from './profile.service';

describe('ProfileController', () => {
  it('recibe el servicio de perfiles', () => {
    const service = {} as ProfileService;
    expect(new ProfileController(service)).toBeInstanceOf(ProfileController);
  });
});
