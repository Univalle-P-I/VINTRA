import {ConflictException,Injectable,UnauthorizedException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {LoginDto} from '.dto/login.dto';
import {TokensDto} from '.dto/tokens.dto';
import {ForgotDto} from  '.dto/forgot-pwd.ts';
import {ResetPwdDto} from  '.dto/reset-pwd.ts';


@Injectable()
export class AuthService {
    constructor(

    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    ) {}
  
    async authenticate(LoginDto: LoginDto): Promise<TokensDto>{
    // Funcion de autenticacion, obtiee el email y la contraseña del usuario y retorna el refreshtoken 
    // y accessToken
    }
    
    async revokeCurrentSession(SessionId: string){
        //Revoca el RefreshToken al momento de cerrar sesion
    }

    async forgotPassword(ForgotDto: ForgotDto){
    }    // Envia un correo con un email template y token unico para restablecer la contraseña

    
    async resetPassword(resetPwdDto: ResetPwdDto){

    }

}