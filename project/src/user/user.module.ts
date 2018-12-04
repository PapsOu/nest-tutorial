import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { UserService } from '@user/user.service';
import { ResetPasswordToken } from '@user/entity/reset-password-token.entity';
import { PasswordEncoderService } from './service/password-encoder.service';
import { ResetPasswordService } from './service/reset-password.service';
import { AuthModule } from '@auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ResetPasswordToken
    ]),
    forwardRef(() => AuthModule)
  ],
  providers:[
    UserService,
    PasswordEncoderService,
    ResetPasswordService
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
