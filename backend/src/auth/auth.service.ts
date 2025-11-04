import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { TokenPayload } from './interfaces/token-payload.interface';
import { AuthResult } from './interfaces/auth-result.interface';

type RefreshTokenRecord = {
  tokenHash: string;
  expiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      displayName: dto.displayName,
    });

    return this.issueTokensForUser(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokensForUser(user);
  }

  async logout(userId: string, dto: LogoutDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return;
    }

    const matching = await this.findMatchingRefreshToken(
      user.refreshTokens ?? [],
      dto.refreshToken,
    );
    if (matching) {
      await this.usersService.clearRefreshTokens(userId);
    }
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResult> {
    const refreshSecret = this.getRefreshSecret();
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const matchingRecord = await this.findMatchingRefreshToken(
      user.refreshTokens ?? [],
      dto.refreshToken,
    );

    if (!matchingRecord) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const userId = this.getUserId(user);

    if (matchingRecord.expiresAt.getTime() < Date.now()) {
      await this.usersService.removeRefreshToken(userId, matchingRecord.tokenHash);
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.usersService.removeRefreshToken(userId, matchingRecord.tokenHash);
    return this.issueTokensForUser(user);
  }

  private async issueTokensForUser(user: UserDocument): Promise<AuthResult> {
    const tokens = await this.createTokens(user);
    const hashedRefresh = await hash(tokens.refreshToken, 10);
    const userId = this.getUserId(user);
    await this.usersService.addRefreshToken(userId, hashedRefresh, new Date(tokens.refreshTokenExpiresAt));

    return tokens;
  }

  private async createTokens(user: UserDocument): Promise<AuthResult> {
    const payload: TokenPayload = { sub: this.getUserId(user), email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: this.configService.get('ACCESS_TOKEN_TTL', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: this.configService.get('REFRESH_TOKEN_TTL', '7d'),
    });

    const accessPayload = this.jwtService.decode(accessToken) as TokenPayload | null;
    const refreshPayload = this.jwtService.decode(refreshToken) as TokenPayload | null;

    return {
      accessToken,
      accessTokenExpiresAt: accessPayload?.exp
        ? new Date(accessPayload.exp * 1000).toISOString()
        : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshPayload?.exp
        ? new Date(refreshPayload.exp * 1000).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(
    user: UserDocument,
  ): { id: string; email: string; displayName?: string } {
    return {
      id: this.getUserId(user),
      email: user.email,
      displayName: user.displayName,
    };
  }

  private getUserId(user: UserDocument): string {
    if (typeof user.id === 'string' && user.id.length > 0) {
      return user.id;
    }

    const objectId = (user as any)._id;
    if (objectId && typeof objectId.toString === 'function') {
      return objectId.toString();
    }

    throw new Error('Unable to determine user identifier');
  }

  private async findMatchingRefreshToken(
    records: RefreshTokenRecord[],
    refreshToken: string,
  ): Promise<RefreshTokenRecord | null> {
    for (const record of records) {
      const isMatch = await compare(refreshToken, record.tokenHash);
      if (isMatch) {
        return record;
      }
    }
    return null;
  }

  private getAccessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }
}
