import { Injectable, NestInterceptor, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { EnvelopeService } from "@common/api/service/envelope.service";
import { map, catchError } from 'rxjs/operators';
import { Envelope } from "@common/api/dto/envelope.dto";
import { PaginatedResources } from "@common/api/resource/paginated-resources";
import { Resource } from "@common/api/resource/resource.interface";
import { AbstractResource } from "@common/api/resource/abstract-resource";

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {

  constructor(
    private envelopeService: EnvelopeService
  ) { }

  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<Envelope> {
    return call$
      .pipe(
        catchError(err => {
          return throwError(
            new HttpException(
              this.mapDataToApiEnvelope(err),
              err.status ? err.status : HttpStatus.INTERNAL_SERVER_ERROR
            )
          )
        }),
        map(data => this.mapDataToApiEnvelope(data))
      )
  }

  private mapDataToApiEnvelope(dataOrError: Resource | PaginatedResources | Error | any): Envelope | any {
    if (dataOrError instanceof PaginatedResources) {
      return this.envelopeService.mapMultipleResources(dataOrError)
    } else if (dataOrError instanceof Error) {
      return this.envelopeService.mapErrorOrException(dataOrError)
    }
    return this.envelopeService.mapSingleResource(dataOrError)
  }
}