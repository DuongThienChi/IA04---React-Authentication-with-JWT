import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const accessSecret =
          config.get<string>('JWT_ACCESS_SECRET') || 'defaultAccessSecretKey';
        return {
          secret: accessSecret,
          signOptions: { expiresIn: config.get('ACCESS_TOKEN_TTL', '15m') },
        };
      },
    }),
  ],
  providers: [AuthService, AccessTokenGuard],
  controllers: [AuthController],
  exports: [AuthService, AccessTokenGuard, JwtModule],
})
export class AuthModule {}
