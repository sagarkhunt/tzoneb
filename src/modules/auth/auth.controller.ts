import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '../../database/entities/user.entity';
import { Auth } from '../../decorators/auth.decorator';
import { AuthUser } from '../../decorators/user.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { LoginDto, RefreshTokenDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() body: SignupDto) {
    return {
      data: await this.authService.signup(body),
      message: 'Signup successfull',
    };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return {
      data: await this.authService.login(body),
      message: 'Login successfull',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() body: RefreshTokenDto) {
    return {
      data: await this.authService.refreshTokens(body.refreshToken),
      message: 'Tokens refreshed',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth([UserRole.USER, UserRole.ADMIN])
  async logout(@AuthUser() user: User) {
    return {
      data: await this.authService.logout(user),
      message: 'Logout successfull',
    };
  }
}
