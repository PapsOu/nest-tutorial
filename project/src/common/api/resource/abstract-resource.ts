import { Resource } from "@common/api/resource/resource.interface";
import { PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractResource implements Resource {

  /**
   * The resource's unique identifier
   *
   * @type {number}
   */
  @PrimaryGeneratedColumn()
  id!: number
}
