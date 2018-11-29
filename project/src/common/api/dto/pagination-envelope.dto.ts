export class PaginationEnvelope {

  /**
   * Current page number
   *
   * @type {number}
   */
  public page: number = 1

  /**
   * Total number of pages
   *
   * @type {number}
   */
  public nbPages: number = 1

  /**
   * Total number of results
   *
   * @type {number}
   */
  public nbResults: number = 1

  /**
   * Number of results per page
   *
   * @type {number}
   */
  public nbResultsPerPage: number = 50
}
