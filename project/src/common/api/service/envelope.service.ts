import { Injectable, HttpException } from '@nestjs/common';
import { Envelope } from '@common/api/dto/envelope.dto';
import { PaginatedResources } from '@common/api/resource/paginated-resources';
import { PaginationEnvelope } from '@common/api/dto/pagination-envelope.dto';
import { ErrorEnvelope } from '@common/api/dto/error-envelope.dto';

@Injectable()
export class EnvelopeService {

  public mapSingleResource(resource: any): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resource)

    return envelope
  }

  public mapMultipleResources(resources: PaginatedResources): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resources.resources)

    envelope.setPagination(
      new PaginationEnvelope(
        resources.page,
        resources.nbPages,
        resources.nbResults,
        resources.nbResultsPerPage
      )
    )

    return envelope
  }

  public mapErrorOrException(error: Error|HttpException): Envelope {
    const envelope = this.getEnvelope()

    if (error instanceof HttpException) {
      envelope.setError(
        new ErrorEnvelope(
          error.message,
          error.getStatus(),
          error.name,
          error.stack
        )
      )
    } else {
      envelope.setError(
        new ErrorEnvelope(
          error.message,
          undefined,
          error.name,
          error.stack
        )
      )
    }

    return envelope
  }

  private getEnvelope(): Envelope {
    return new Envelope()
  }
}
