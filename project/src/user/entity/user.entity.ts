import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { Token } from "@auth/entity/token.entity";
import { AbstractResource } from "@common/api/resource/abstract-resource";

@Entity()
export class User extends AbstractResource {
  
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

  @Column("varchar", {
    length: 64,
    unique: true
  })
  password!: string

  @OneToOne(type => Token, {
    cascade: true,
    onDelete: "SET NULL"
  })
  @JoinColumn()
  token!: Token
}
