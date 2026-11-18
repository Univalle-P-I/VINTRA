import { Injectable} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ForgotPwdDto } from './dto/forgot-pwd';
import { ResetPwdDto } from './dto/reset-pwd.dto';
import { UserService } from '../users/users.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService
    ) { }

    async authenticate(LoginDto: LoginDto) {}

    // Funcion de autenticacion, obtiee el email y la contraseña del usuario y retorna el refreshtoken
    // y accessToken

    async revokeCurrentSession(SessionId: string){}

    //Revoca el RefreshToken al momento de cerrar sesion
    async forgotPassword(ForgotDto: ForgotPwdDto){}


    // Envia un correo con un email template y token unico para restablecer la contraseña
    async resetPassword(resetPwdDto: ResetPwdDto){}

    }

}
