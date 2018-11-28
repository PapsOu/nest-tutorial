import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@user/entity/user.entity';
import { UserService } from '@user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ],
  providers:[
    UserService
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
