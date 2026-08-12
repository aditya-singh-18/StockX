import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper to compute SHA-256 hash of an opaque token for DB lookup
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Helper to generate a 40-byte random opaque token
   */
  private generateOpaqueToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Helper to generate a 15-minute access token
   */
  private generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'stockflow_jwt_super_secret_key_2026'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  /**
   * Authenticate user with email/password and issue access token + refresh token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact an administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.key);

    const accessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Generate and store opaque refresh token
    const rawRefreshToken = this.generateOpaqueToken();
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    this.logger.log(`User logged in: ${user.email} (${user.role.name})`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.roleId,
        permissions,
      },
    };
  }

  /**
   * Refresh session with Token Rotation:
   * Revokes old refresh token and issues a new access token + new refresh token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      this.logger.warn(`Attempted re-use of revoked refresh token for user: ${storedToken.userId}`);
      throw new UnauthorizedException('Refresh token has already been revoked. Please log in again.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired. Please log in again.');
    }

    if (!storedToken.user || !storedToken.user.isActive) {
      throw new UnauthorizedException('User account is inactive or not found.');
    }

    // Refresh Token Rotation in a transaction
    const newRawRefreshToken = this.generateOpaqueToken();
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + this.refreshTokenTtlMs);

    await this.prisma.$transaction([
      // 1. Revoke the old refresh token
      this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      // 2. Store the newly rotated refresh token
      this.prisma.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          userId: storedToken.userId,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    const newAccessToken = this.generateAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role.name,
    });

    this.logger.log(`Tokens refreshed & rotated for user: ${storedToken.user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Log out single session by revoking the provided refresh token
   */
  async logout(logoutDto: LogoutDto) {
    const { refreshToken } = logoutDto;
    const tokenHash = this.hashToken(refreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (tokenRecord && !tokenRecord.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
      this.logger.log(`Refresh token revoked for user: ${tokenRecord.userId}`);
    }
  }

  /**
   * Log out of all sessions for the authenticated user
   */
  async logoutAll(userId: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`All sessions (${result.count} active tokens) revoked for user: ${userId}`);
  }

  /**
   * Get active user profile and capabilities
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.key);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      permissions,
      createdAt: user.createdAt,
    };
  }
}
