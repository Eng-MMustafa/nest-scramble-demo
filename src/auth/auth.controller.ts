import { Controller, Post, Body } from '@nestjs/common';
import { IsString } from 'class-validator';

class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

/**
 * Auth endpoints for the demo API.
 */
@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() dto: LoginDto) {
    return {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token',
      token_type: 'bearer',
    };
  }
}
