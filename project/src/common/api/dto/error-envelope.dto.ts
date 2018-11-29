import { HttpStatus } from "@nestjs/common";

export class ErrorEnvelope {

  /**
   * The error / exception message
   *
   * @type {string}
   */
  public message: string = 'An error occurred'

  /**
   * The error / exception code
   *
   * @type {number}
   */
  public code: number

  /**
   * The optional specific data
   *
   * @type {*}
   */
  public data: any

  /**
   * The error / exception stacktrace (for dev env)
   *
   * @type {*}
   */
  public trace: any

  constructor(
    message: string,
    code?: number,
    data?: any,
    trace?: any
  ) {
    this.message = message
    this.code = code ? code : HttpStatus.INTERNAL_SERVER_ERROR
    this.data = data
    this.trace = trace
  }
}
