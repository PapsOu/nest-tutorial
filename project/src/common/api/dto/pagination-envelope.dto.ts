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
  public nbResultsPerPage: number = Number(process.env.PAGINATION_DEFAULT_LIMIT)

  constructor(
    page: number,
    nbPages: number,
    nbResults: number,
    nbResultsPerPage: number
  ) {
    this.page = page
    this.nbPages = nbPages
    this.nbResults = nbResults
    this.nbResultsPerPage = nbResultsPerPage
  }
}
