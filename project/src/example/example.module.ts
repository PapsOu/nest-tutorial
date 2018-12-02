import { Module } from '@nestjs/common';
import { ExampleController } from './controller/example.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ],
  controllers: [ExampleController]
})
export class ExampleModule {}
