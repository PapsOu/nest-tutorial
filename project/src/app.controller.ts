import { Get, Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateExampleDto } from '@common/dto/create-example-dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Get()
  root(): string {
    return this.appService.root();
  }

  @Post()
  displayName(
    @Body() createExampleDto: CreateExampleDto
  ): CreateExampleDto {
    return createExampleDto;
  }
}
