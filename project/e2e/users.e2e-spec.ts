import * as request from 'supertest';
import 'jest';
import { Common } from './common/common';

describe('Users', () => {
  const newUserData = {
    'username': 'newUser',
    'email': 'newUser@test.com',
    'password': 'newUser',
  }

  beforeAll(async () => {
    Common.loadConfig()
    await Common.bootstrap()
    await Common.login()
  })

  it('Should create a user', () => {
    return request(Common.app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer ' + Common.token)
      .send(newUserData)
      .expect(201)
      .then((res) => {
        const user = res.body.data

        expect(user).toHaveProperty('id')
        expect(user).not.toHaveProperty('password')
        expect(user).toEqual(
          expect.objectContaining({
            "username": newUserData.username
          })
        )
        expect(user).toEqual(
          expect.objectContaining({
            "email": newUserData.email
          })
        )
      })
  })
})
