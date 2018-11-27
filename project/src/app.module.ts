import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    CommonModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: `${__dirname}/../${process.env.DB_PATH}`,
        entities: [
          User
        ],
        synchronize: true,
        keepConnectionAlive: true // Allows using the same connection between reloads with webpack
      })
    }),
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
