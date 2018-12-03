---
description: Rédaction des tests end-to-end
---

# Tests e2e

Dans la section précédente, nous avons définis nos critères d'acceptation.

Maintenant, nous allons les transcrire en tests exécutables, dans des tests end-to-end.

## Outillage

Nest utilise de base [jest](https://jestjs.io/docs/en/getting-started) et [supertest](https://github.com/visionmedia/supertest). Leur documentation est claire et beaucoup d'exemples sont disponibles sur le net.

## Organisation

Nous faisons le choix de mettre nos tests e2e dans le dossier `e2e` \(que nous créons\) à la racine du projet.

Renommons le test e2e déjà présent \(`test/app.e2e-spec.ts`\)  en `e2e/users.e2e-spec.ts` :

{% code-tabs %}
{% code-tabs-item title="e2e/users.e2e-spec.ts" %}
```typescript
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```
{% endcode-tabs-item %}
{% endcode-tabs %}

On peut voir qu'il faut initialiser notre serveur Nest, comme cela est fait dans le point d'entrée `src/main.ts`.

Afin d'alléger les futurs tests e2e, on va créer une partie commune qui se chargera de cette initialisation et se chargera de tâches communes à la plupart des tests \(chargement de la configuration, connexion de l'utilisateur de test, fixtures, nettoyage, rapports, etc.\).

```bash
$ nest generate class ../e2e/common/common
```

{% code-tabs %}
{% code-tabs-item title="e2e/common/common.ts" %}
```typescript
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
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Ce qui nous donne cette initialisation de test :

{% code-tabs %}
{% code-tabs-item title="e2e/users.e2e-spec.ts" %}
```typescript
import * as request from 'supertest';
import 'jest';
import { Common } from './common/common';

describe('Users', () => {
  beforeAll(async () => {
    Common.loadConfig()
    await Common.bootstrap()
    await Common.login()
  })

  it('Should create a user', () => {
    // (...]
  })
})
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Écriture d'un test

{% hint style="info" %}
Afin de ne pas alourdir cette section, nous verrons uniquement le test de création d'un utilisateur. Les autres tests sont disponibles sur le dépôt des sources de ce tutoriel \([https://github.com/PapsOu/nest-tutorial](https://github.com/PapsOu/nest-tutorial)\).
{% endhint %}

Voici le test de création d'utilisateur :

```typescript
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
```

Regardons de plus près l'usage de supertest :

```typescript
return request(Common.app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer ' + Common.token)
      .send(newUserData)
      .expect(201)
      .then((res) => {
```

On initialise une requête pour notre application

On définit la méthode et l'URI de la requête \(`POST` et `/users`\)

On y ajoute l'entête d'autorisation `Authorization` permettant d'identifier l'utilisateur avec le jeton de type `Bearer`.

On envoie comme charge de notre requête l'objet `newUserData`.

On spécifie que le code de réponse doit être `201 Created`.

Ensuite, on traite le corps de la réponse :

```typescript
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
```

On vérifie que la réponse contient un champ `id` \(sans vérifier sa valeur\)

On vérifie que le champ `password` n'est pas présent \(cela n'a pas été précisé dans les besoins, mais c'est une question de bon sens et de sécurité\).

{% hint style="info" %}
Pour cela, on pourra utiliser un intercepteur global qui se chargera de supprimer le champ `password` lorsqu'un utilisateur sera sérialisé dans le corps des réponses de l'API.
{% endhint %}

On vérifie que le champs `username` est bien égal à la valeur que nous avons transmise.

On vérifie que le champs `email` est bien égal à la valeur que nous avons transmise.

## Exécution du test

Modifions notre fichier `package.json` qui contient la commande de lancement des tests e2e sous la clé `scripts`.

```javascript
{
  // [...]
  "scripts": {
    // [...]
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --detectOpenHandles"
  },
  // [...]
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "moduleNameMapper": {
      "@auth/(.*)": "<rootDir>/src/auth/$1",
      "@common/(.*)": "<rootDir>/src/common/$1",
      "@user/(.*)": "<rootDir>/src/user/$1",
      "@example/(.*)": "<rootDir>/src/example/$1"
    },
    "rootDir": ".",
    "testRegex": ".spec.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "testEnvironment": "node"
  }
}
```

Lançons les tests :

```bash
$ npm run test:e2e

> nest-tutorial@0.0.0 test:e2e /nest-tutorial/project
> jest --detectOpenHandles

 FAIL  e2e/users.e2e-spec.ts
  Users
    ✕ Should create a user (18ms)

  ● Users › Should create a user

    expected 201 "Created", got 404 "Not Found"

      at Test.Object.<anonymous>.Test._assertStatus (node_modules/supertest/lib/test.js:268:12)
      at Test.Object.<anonymous>.Test._assertFunction (node_modules/supertest/lib/test.js:283:11)
      at Test.Object.<anonymous>.Test.assert (node_modules/supertest/lib/test.js:173:18)
      at Server.localAssert (node_modules/supertest/lib/test.js:131:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        1.79s, estimated 2s
Ran all test suites.

Jest has detected the following 1 open handle potentially keeping Jest from exiting:

  ●  TCPSERVERWRAP

      18 |   it('Should create a user', () => {
      19 |     return request(Common.app.getHttpServer())
    > 20 |       .post('/users')
         |        ^
      21 |       .set('Authorization', 'Bearer ' + Common.token)
      22 |       .send(newUserData)
      23 |       .expect(201)

      at Test.Object.<anonymous>.Test.serverAddress (node_modules/supertest/lib/test.js:59:33)
      at new Test (node_modules/supertest/lib/test.js:36:12)
      at Object.obj.(anonymous function) [as post] (node_modules/supertest/index.js:25:14)
      at Object.it (e2e/users.e2e-spec.ts:20:8)

npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! nest-tutorial@0.0.0 test:e2e: `jest --detectOpenHandles`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the nest-tutorial@0.0.0 test:e2e script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     ~/.npm/_logs/2018-12-03T15_54_24_980Z-debug.log
```

{% hint style="success" %}
Le test ne passe pas, c'est normal, nous n'avons encore rien commencé.
{% endhint %}

Nous pouvons maintenant démarrer le développement de notre gestion utilisateur.

