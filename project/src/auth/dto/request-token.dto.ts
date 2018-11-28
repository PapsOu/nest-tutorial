import { IsNotEmpty } from "class-validator";

export class RequestTokenDto {
  @IsNotEmpty()
  public readonly username!: string

  @IsNotEmpty()
  public readonly password!: string
}
