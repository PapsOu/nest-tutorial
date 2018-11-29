import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { EnvelopeService } from './api/service/envelope.service';

@Module({
  providers: [
  CommonService,
  EnvelopeService]
})
export class CommonModule {
  public test(): string {
    return 'test';
  }
}
