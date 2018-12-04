import { Injectable } from '@nestjs/common';
import { hash, compare, genSalt } from 'bcrypt';

@Injectable()
export class PasswordEncoderService {
  
  /**
   * Hashes the password with bcrypt and generated salt
   * 
   * @param password 
   */
  public async encodePassword(password: string): Promise<string> {
    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)

    return hashedPassword
  }

  /**
   * Compares a plain password to a hashed password
   * 
   * @param password string
   * @param hashedPassword string
   */
  public async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await compare(password, hashedPassword)
  }
}
