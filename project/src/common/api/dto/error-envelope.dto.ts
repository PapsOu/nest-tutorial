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
  public code: number = HttpStatus.INTERNAL_SERVER_ERROR

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
}
