import { Resource } from "@common/api/resource/resource.interface";

export class PaginatedResources {
  public resources: Array<Resource> = []
  public page: number = 1
  public nbPages: number = 1
  public nbResults: number = 0
  public nbResultsPerPage: number = Number(process.env.PAGINATION_DEFAULT_LIMIT)

  constructor(
    resources: Array<Resource>,
    page: number,
    nbPages: number,
    nbResults: number,
    nbResultsPerPage: number
  ) {
    this.resources = resources
    this.page = page
    this.nbPages = nbPages
    this.nbResults = nbResults
    this.nbResultsPerPage = nbResultsPerPage
  }
}
