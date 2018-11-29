import { Module } from '@nestjs/common';
import { CommonService } from '@common/common.service';
import { EnvelopeService } from '@common/api/service/envelope.service';

@Module({
  providers: [
    CommonService,
    EnvelopeService
  ]
})
export class CommonModule { }
