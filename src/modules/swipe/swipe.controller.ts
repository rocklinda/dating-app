import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SwipeInput } from './inputs/swipe.input';
import { SwipeResponse } from './responses/swipe.response';
import { SwipeService } from './swipe.service';

@Controller('swipe')
export class SwipeController {
  constructor(private readonly swipeService: SwipeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async swipe(
    @Req() req: any,
    @Body() swipeInput: SwipeInput,
  ): Promise<{ isMatch: boolean; message: string }> {
    return await this.swipeService.swipe(req.user?.id, swipeInput);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<SwipeResponse> {
    const result = await this.swipeService.getSwipeList(
      req.user?.id,
      page,
      limit,
    );
    return result;
  }
}
