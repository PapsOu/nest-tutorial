import { Injectable } from '@nestjs/common';
import { User } from '@user/entity/user.entity';
import { ResetPasswordToken } from '@user/entity/reset-password-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from '@auth/service/token.service';
import { UserService } from '@user/user.service';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(ResetPasswordToken)
    private readonly repository: Repository<ResetPasswordToken>,
    private readonly authTokenService: TokenService,
    private readonly userService: UserService
  ) { }

  /**
   * Creates a password reset token
   * 
   * @returns {Promise<ResetPasswordToken>}
   */
  public async createResetPasswordToken(): Promise<ResetPasswordToken> {
    const token = await this.repository.create()

    token.token = this.authTokenService.generateUniqueToken()

    return this.repository.save(token)
  }

  /**
   * Creates a token for given user
   *
   * @param {User} user
   * 
   * @returns {Promise<User>}
   */
  public async createResetPasswordTokenForUser(user: User): Promise<User> {
    const token = await this.createResetPasswordToken()

    user.ResetPasswordToken = token

    await this.userService.updateUser(user)

    return user
  }

  /**
   * Fetches a ResetPasswordToken that matches the given token
   *
   * @param {string} token
   * 
   * @returns {(Promise<ResetPasswordToken | undefined>)}
   */
  public async findUserByResetPasswordToken(token: string): Promise<ResetPasswordToken | undefined> {
    return await this.repository.findOne(
      { token: token },
      { relations: ['user'] }
    )
  }
}
