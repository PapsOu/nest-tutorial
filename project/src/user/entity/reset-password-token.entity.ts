import { Token } from "@auth/entity/token.entity";
import { Entity } from "typeorm";

@Entity()
export class ResetPasswordToken extends Token {

}
