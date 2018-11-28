import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', {
    length: 128,
    unique: true,
    nullable: false,
  })
  token!: string

  @Column("text", {
    nullable: false
  })
  tokenDate: Date = new Date()
}
