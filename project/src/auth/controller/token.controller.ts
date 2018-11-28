import { Controller, Body, HttpException, HttpStatus, Post, Put, Req, Delete, UseGuards, Get } from '@nestjs/common';

import { Token } from '@auth/entity/token.entity';
import { TokenService } from '@auth/service/token.service';
import { RequestTokenDto } from '@auth/dto/request-token.dto';
import { UserService } from '@user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@user/entity/user.entity';

@Controller('auth')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) { }

  @Post('token')
  public async token(
    @Body() requestTokenDto: RequestTokenDto
  ): Promise<Token> {
    const user = await this.userService.getUserByUsernameAndPassword(
      requestTokenDto.username,
      requestTokenDto.password,
    )

    if (!user) {
      throw new HttpException('Invalid username and/or password', HttpStatus.UNAUTHORIZED)
    }

    const token = await this.tokenService.createToken(user)

    await this.userService.updateUser(user)
    
    return token
  }

  @UseGuards(AuthGuard())
  @Put('refresh')
  public async refresh(
    @Req() request: any
  ): Promise<Token> {
    const token = await this.tokenService.createToken(request.user)

    await this.userService.updateUser(request.user)

    return token
  }

  @UseGuards(AuthGuard())
  @Delete('invalidate')
  public async invalidate(
    @Req() request: any
  ):Promise<boolean> {
    const token = request.user.token

    return await this.tokenService.deleteToken(token.id)
  }

  @Get()
  public async createDummyUser(): Promise<User> {
    return await this.userService.createDummyUser()
  }
}
