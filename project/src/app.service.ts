import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return process.env.APP_NAME ?
      process.env.APP_NAME :
      'No app name configured'
  }
}
