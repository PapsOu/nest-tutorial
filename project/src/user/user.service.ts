import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { Token } from '@auth/entity/token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>
  ) { }

  public async getUserByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<User|undefined> {
    return await this.repository.findOne({
      username: username,
      password: password
    })
  }

  public async getUserByToken(token:Token): Promise<User|undefined> {

    return await this.repository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.token', 'token')
      .where('user.token.id = :tk', {'tk': token.id})
      .getOne()
  }

  public async createDummyUser(): Promise<User> {
    const user = await this.repository.create()

    user.email = 'test@test.com'
    user.username = 'test'
    user.password = 'test'
    
    return await this.repository.save(user)
  }

  public async updateUser(user: User): Promise<void> {
    await this.repository.update(user.id, user)
  }
}
