import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)

export class AuthController {
    constructor(  private readonly AuthService: AuthService){}
}
