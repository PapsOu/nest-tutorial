import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateExampleDto {
  @IsEmail()
  public readonly email!: string

  @MinLength(3)
  @IsNotEmpty()
  public readonly name!: string
}
