import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";


describe('AuthController', () => {
  it('recibe el servicio de autenticacion', () => {
    const service = {} as AuthService;
    expect(new AuthController(service)).toBeInstanceOf(AuthController);
  });
});
