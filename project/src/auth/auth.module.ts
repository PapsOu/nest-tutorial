import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '@auth/service/token.service';
import { Token } from '@auth/entity/token.entity';
import { TokenController } from './controller/token.controller';
import { UserModule } from '@user/user.module';
import { DefaultStrategy } from '@auth/strategy/default';


@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'bearer'
    }),
    TypeOrmModule.forFeature([
      Token
    ]),
    UserModule
  ],
  providers: [
    TokenService,
    DefaultStrategy
  ],
  controllers: [
    TokenController
  ]
})
export class AuthModule {}
