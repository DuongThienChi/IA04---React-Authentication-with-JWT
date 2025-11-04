import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TokenPayload } from '../auth/interfaces/token-payload.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: TokenPayload) {
    const found = await this.usersService.findById(user.sub);
    if (!found) {
      throw new NotFoundException('User not found');
    }

    const idValue = (found as any)._id?.toString?.() ?? found.id?.toString?.();
    if (!idValue) {
      throw new NotFoundException('User identifier missing');
    }

    return {
      id: idValue,
      email: found.email,
      displayName: found.displayName,
    };
  }
}
