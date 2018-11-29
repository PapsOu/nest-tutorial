import { Injectable } from '@nestjs/common';
import { Envelope } from '../dto/envelope.dto';

@Injectable()
export class EnvelopeService {

  public mapSingleResource(resource: any): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resource)

    return envelope
  }

  public mapMultipleResources(resources: Array<any>): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resources)

    

    return envelope
  }

  public mapErrorOrException(resource: any): Envelope {
    const envelope = this.getEnvelope()



    return envelope
  }

  private getEnvelope(): Envelope {
    return new Envelope()
  }
}
