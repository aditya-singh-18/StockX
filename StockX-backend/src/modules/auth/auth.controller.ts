import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password, receiving access & refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully. Returns 15m JWT, opaque refresh token, and user profile with permissions.',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh session using refresh token (with automatic token rotation)' })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed. Returns fresh access token and rotated refresh token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or revoked refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log out current session by revoking the refresh token' })
  @ApiResponse({ status: 204, description: 'Session refresh token revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log out all active sessions across all devices for the current user' })
  @ApiResponse({ status: 204, description: 'All user sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logoutAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get currently authenticated user profile and permissions' })
  @ApiResponse({ status: 200, description: 'Returns active session user and dynamic capability list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }
}
