import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { ExampleModule } from '@example/example.module';
import { User } from '@user/entity/user.entity';
import { Token } from '@auth/entity/token.entity';
import { PasswordResetToken } from '@user/entity/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: `${__dirname}/../${process.env.DB_PATH}`,
        entities: [
          User,
          Token,
          PasswordResetToken
        ],
        synchronize: true,
        keepConnectionAlive: true // Allows using the same connection between reloads with webpack
      })
    }),
    AuthModule,
    CommonModule,
    UserModule,
    ExampleModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
