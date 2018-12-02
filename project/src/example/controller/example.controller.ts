import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { Repository } from 'typeorm';

@Controller('example')
export class ExampleController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  @Get()
  public async exception() {
    let user = new User()

    user.username = 'test'
    user.email = 'test@test.com'

    await this.userRepository.create(user)
    await this.userRepository.save(user)

    return user
  }
}
