import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserEntity } from '../../databases/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPremiumInput } from './inputs/user-premium.input';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgradeToPremium(
    @Req() req: any,
    @Body() userPremiumInput: UserPremiumInput,
  ): Promise<UserEntity> {
    return await this.userService.upgradeToPremium(
      req.user?.id,
      userPremiumInput,
    );
  }
}
