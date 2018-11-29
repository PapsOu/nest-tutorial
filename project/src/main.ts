import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { EnvelopeInterceptor } from '@common/api/interceptor/envelope-interceptor';
import { EnvelopeService } from '@common/api/service/envelope.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true // When validating DTO, force transformation of data into a DTO class
    })
  )

  // Map all responses to the API envelope
  app.useGlobalInterceptors(
    new EnvelopeInterceptor(
      new EnvelopeService()
    )
  )

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

dotenv.config(); // Load configuration before bootstrapping

bootstrap();