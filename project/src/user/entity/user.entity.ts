import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id!: number
  
  @Column("varchar", {
    length: 128,
    unique: true
  })
  username!: string

  @Column("varchar", {
    length: 256,
    unique: true
  })
  email!: string
}
