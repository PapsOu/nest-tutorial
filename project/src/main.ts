import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true // When validating DTO, force transformation of data into a DTO class
    })
  )

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

dotenv.config(); // Load configuration before bootstrapping

bootstrap();