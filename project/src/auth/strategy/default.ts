import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';

import { TokenService } from '@auth/service/token.service';
import { UserService } from '@user/user.service';
import { User } from '@user/entity/user.entity';

@Injectable()
export class DefaultStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {
    super()
  }

  async validate(tokenString: string): Promise<User> {
    const token = await this.tokenService.getToken(tokenString)
    const tokenValidityDuration = Number(process.env.API_TOKEN_TTL)

    if (token === undefined) {
      throw new UnauthorizedException()
    }

    if (new Date(token.tokenDate).getTime() + tokenValidityDuration < new Date().getTime()) {
      throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED)
    }

    // Fetch user corresponding to token
    const user = await this.userService.getUserByToken(token)

    if (user === undefined) {
      throw new UnauthorizedException()
    }
    
    return user
  }
}