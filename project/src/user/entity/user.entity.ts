import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { Token } from "@auth/entity/token.entity";
import { AbstractResource } from "@common/api/resource/abstract-resource";
import { PasswordResetToken } from "@user/entity/password-reset-token.entity";

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
    length: 64
  })
  password!: string

  @OneToOne(type => Token, {
    cascade: true,
    onDelete: "SET NULL"
  })
  @JoinColumn()
  token!: Token

  @OneToOne(type => PasswordResetToken, {
    cascade: true,
    onDelete: "SET NULL"
  })
  @JoinColumn()
  passwordResetToken!: PasswordResetToken
}
