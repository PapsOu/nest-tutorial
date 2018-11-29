import { Repository } from "typeorm";
import { ResourceRepository, PaginationData } from "@common/api/resource/resource-repository.interface";
import { Resource } from "@common/api/resource/resource.interface";
import { PaginatedResources } from "@common/api/resource/paginated-resources";

export abstract class AbstractResourceRepository<T extends Resource> implements ResourceRepository {

  constructor(
    protected repository: Repository<T>
  ) { }

  public async findOneById(id: number): Promise<T | undefined> {
    return this.repository.findOne({ where: { id: id }})
  }

  public async findByPaginated(criteria: any, paginationData: PaginationData): Promise<PaginatedResources> {
    const queryParameters = {
      where: criteria,
      order: paginationData.order,
      skip: paginationData.offset,
      take: paginationData.limit
    }

    const resourcesCount = await this.countResource(criteria)

    let totalPageNumber = Math.ceil(resourcesCount / (paginationData.limit))
    let currentPageNumber = paginationData.limit
    let offset = (currentPageNumber - 1) * paginationData.limit

    // Handle the case when the asked page is greater than number of pages
    if (offset > (totalPageNumber - 1) * paginationData.limit) {
      offset = (totalPageNumber - 1) * paginationData.limit
      currentPageNumber = totalPageNumber
    }

    const resources = await this.repository.find(queryParameters)

    return new PaginatedResources(
      resources,
      resourcesCount,
      totalPageNumber,
      currentPageNumber,
      paginationData.limit
    )
  }

  /**
   * Perform a count query with given criteria
   *
   * @param {*} criteria
   * 
   * @returns {Promise<number>}
   */
  private async countResource(criteria: any): Promise<number> {
    const { resourcesCount } = await this.repository
      .createQueryBuilder("r")
      .select("COUNT(*)", "resourcesCount")
      .where(criteria)
      .getRawOne()

    return resourcesCount
  }
}
