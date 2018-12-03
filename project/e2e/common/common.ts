import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import * as dotenv from 'dotenv'
import * as fs from 'fs';

import { AppModule } from "../../src/app.module";
import { EnvelopeInterceptor } from '../../src/common/api/interceptor/envelope-interceptor';
import { EnvelopeService } from '../../src/common/api/service/envelope.service';

export class Common {
  /**
   * The Nest Application
   *
   * @type {INestApplication}
   */
  public static app: INestApplication

  /**
   * The auth token
   *
   * @type {string}
   */
  public static token: string

  /**
   * Load dotenv config for tests
   */
  public static loadConfig = (): void => {
    dotenv.config(fs.readFileSync(__dirname + '/../../.env'))
  }

  /**
   * Bootstraps the Nest application
   *
   * @returns {Promise<INestApplication>}
   */
  public static async bootstrap(): Promise<INestApplication> {
    const module = await Test
      .createTestingModule({
        imports: [
          AppModule
        ],
      })
      .compile()

    Common.app = module.createNestApplication()

    // Use global validation pipe
    Common.app.useGlobalPipes(
      new ValidationPipe({
        transform: true
      })
    )
    // Map all responses to the API envelope
    Common.app.useGlobalInterceptors(
      new EnvelopeInterceptor(
        new EnvelopeService()
      )
    )

    return Common.app.init()
  }

  /**
   * Auth test user
   *
   * @param {string} [username]
   * @param {string} [password]
   * 
   * @returns {Promise<void>}
   */
  public static async login(
    username?: string,
    password?: string
  ): Promise<void> {
    const loginData = {
      "username": username ? username : process.env.E2E_USERNAME,
      "password": password ? password : process.env.E2E_PASSWORD
    }

    return request(Common.app.getHttpServer())
      .post('/auth/token')
      .set('Content-Type', 'application/json')
      .send(loginData)
      .then((res) => {
        Common.token = res.body.data.token
      })
  }
}
