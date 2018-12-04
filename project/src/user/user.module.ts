import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@user/entity/user.entity';
import { UserService } from '@user/user.service';
import { PasswordResetToken } from '@user/entity/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PasswordResetToken
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
