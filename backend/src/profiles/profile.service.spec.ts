import type { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import type { Profile } from './entities/profile.entity';
import type { CreateProfileDto } from './dto/create.profile.dto';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    service = new ProfileService({} as Repository<Profile>);
  });

  it('expone las operaciones de perfiles', async () => {
    await expect(service.create('user-1', {} as CreateProfileDto)).resolves.toBeUndefined();
    await expect(service.findOne('profile-1')).resolves.toBeUndefined();
    await expect(service.deactivate('profile-1')).resolves.toBeUndefined();
  });
});
