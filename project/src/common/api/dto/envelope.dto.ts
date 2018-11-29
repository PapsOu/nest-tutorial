import { PaginationEnvelope } from "@common/api/dto/pagination-envelope.dto";
import { ErrorEnvelope } from "@common/api/dto/error-envelope.dto";

export class Envelope {

  /**
   * The response payload
   *
   * @type {(Array<any> | any | null)}
   */
  public data: Array<any> | any | null = null

  /**
   * The response pagination
   *
   * @type {(PaginationEnvelope | null)}
   */
  public pagination: PaginationEnvelope | null = null

  /**
   * The response errors
   *
   * @type {(ErrorEnvelope | null)}
   */
  public error: ErrorEnvelope | null = null

  /**
   * Sets a single resource
   *
   * @param {*} resource
   */
  public setData(resource: any): void {
    this.data = resource
  }

  /**
   * Sets pagination
   *
   * @param {PaginationEnvelope} pagination
   */
  public setPagination(pagination: PaginationEnvelope): void {
    this.pagination = pagination
  }

  /**
   * Sets error
   *
   * @param {ErrorEnvelope} error
   */
  public setError(error: ErrorEnvelope): void {
    this.error = error
  }
}
