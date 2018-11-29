import { Resource } from "@common/api/resource/resource.interface";
import { PaginatedResources } from "@common/api/resource/paginated-resources";

export interface ResourceRepository {
  /**
   * Finds a resource by its id
   *
   * @param {number} id
   * 
   * @returns {(Promise<Resource | undefined>)}
   */
  findOneById(id: number): Promise<Resource | undefined>

  /**
   * Performs a paginated query
   *
   * @param {*} criteria
   * @param {PaginationData} paginationData
   * 
   * @returns {Promise<PaginatedResources>}
   */
  findByPaginated(criteria: any, paginationData: PaginationData): Promise<PaginatedResources>
}

export interface PaginationData {
  /**
   * { field: 'ASC|DESC' }
   *
   * @type {*}
   */
  order: any
  offset: number
  limit: number
}