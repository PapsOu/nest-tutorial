import * as uuid from 'uuid/v4'
import * as randomHex from 'random-hex-string'
import { Injectable } from '@nestjs/common';
import { Token } from '@auth/entity/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token) private readonly repository: Repository<Token>
  ) { }

  public async createToken(user: User): Promise<Token> {
    const token = await this.repository.create()

    token.token = this.generateUniqueToken()

    // Remove existing token if necessary
    if (user.token) {
      await this.deleteToken(user.token.id)
    }
    // Associate user and token together
    user.token = token

    return await this.repository.save(token)
  }

  public async getToken(token: string): Promise<Token | undefined> {
    return await this.repository.findOne({
      token: token
    })
  }

  public async deleteToken(id: number): Promise<boolean> {
    await this.repository.delete(id)

    return true
  }

  public generateUniqueToken(): string {
    const tokenUniquePart = uuid().replace(/\-/g, '')
    const token = randomHex.sync(tokenUniquePart.length)

    return tokenUniquePart.concat(token)
  }
}
