---
description: Intégration de Passport pour gérer l'authentification à notre API
---

# Authentification

## Règles à implémenter

Prenons comme exemple la création d'une API. Les utilisateurs s'authentifieront à l'aide de leur nom d'utilisateur \(ou leur email\) et leur mot de passe. L'authentification sera gérée sous la forme d'un jeton généré et unique.

{% hint style="info" %}
Afin de simplifier les exemples, nous n'implémenterons pas une authentification OAuth2 \(avec `client_id`, `client_secret`\). Nous allons simplement implémenter la stratégie [Bearer](https://www.npmjs.com/package/passport-bearer-strategy).
{% endhint %}

Nous allons construire l'API d'authentification avec 3 points d'entrée :

* Demande de jeton `POST:/auth/token`.
* Rafraîchissement de jeton `PUT:/auth/refresh`.
* Invalidation de jeton `DELETE:/auth/invalidate`.

Nous allons nous servir de [Passport](http://www.passportjs.org/) pour gérer la correspondance jeton &lt;&gt; utilisateur. Pour la génération de jeton, nous allons nous baser sur un [uuid](https://www.npmjs.com/package/uuid) ainsi qu'une composante aléatoire avec [random-hex-string](https://www.npmjs.com/package/random-hex-string). 

## Modulé dédié

Générons un module dédié à l'authentification :

```bash
$ nest generate module auth
```

## Installation du composant

Nest possède un [module d'intégration de passport](https://docs.nestjs.com/techniques/authentication), qui facilite cette authentification.

Installons les packages nécessaires :

```bash
$ npm install --save @nestjs/passport passport passport-http-bearer random-hex-string uuid
```

Ensuite, déclarons la configuration de passport via le module de Nest :

{% code-tabs %}
{% code-tabs-item title="src/auth/auth.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'bearer'
    }),
  ]
})
export class AuthModule {}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Mise en place des éléments

Pour que tout fonctionne correctement, nous avons besoin :

* d'un modèle reflétant les jetons, leur date de création.
* d'un service qui aura comme rôle de récupérer le jeton en base de donnée correspondant à un jeton passé en paramètre.
* d'une stratégie d'authentification, qui se chargera de gérer la validité du jeton.
* d'un contrôleur qui exposera les 3 points d'entrée décrits précédemment.

### Le modèle de jeton

Créons une entité qui sera composée de 3 champs : `id`, `token`, `tokenDate`.

```bash
$ nest generate class auth/entity/token
```

{% code-tabs %}
{% code-tabs-item title="src/auth/entity/token.entity.ts" %}
```typescript
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
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Déclarons notre nouvelle entité dans son module :

{% code-tabs %}
{% code-tabs-item title="src/auth/auth.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenService } from '@auth/service/token.service';
import { Token } from '@auth/entity/token.entity';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'bearer'
    }),
    TypeOrmModule.forFeature([
      Token
    ])
  ],
  providers: [TokenService]
})
export class AuthModule {}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

N'oublions pas de déclarer l'entité dans le module principal

{% code-tabs %}
{% code-tabs-item title="src/app.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@auth/auth.module';

import { User } from '@user/entity/user.entity';
import { Token } from '@auth/entity/token.entity';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        // [...]
        entities: [
          User,
          Token
        ],
      })
    }),
    AuthModule,
    // [...]
  ],
})
export class AppModule { }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### Le service de jeton

Le service exposera 3 méthodes :

* Création de jeton
* Récupération de jeton
* Suppression de jeton
* Génération d'un jeton unique \(chaîne\)

Générons un service dans le module `@auth`:

```bash
$ nest generate service auth/service/token --flat
```

{% code-tabs %}
{% code-tabs-item title="src/auth/service/token.service.ts" %}
```typescript
import * as uuid from 'uuid/v4'
import * as randomHex from 'random-hex-string'
import { Injectable } from '@nestjs/common';
import { Token } from '@auth/entity/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token) private readonly repository: Repository<Token>
  ) { }

  public async createToken(user: User): Promise<Token> {
    const token = await this.repository.create()

    token.token = this.generateUniqueToken()

    // Remove existing token if necessary
    if (user.token) {
      await this.deleteToken(user.token.id)
    }
    // Associate user and token together
    user.token = token

    return await this.repository.save(token)
  }

  public async getToken(token: string): Promise<Token | undefined> {
    return await this.repository.findOne({
      token: token
    })
  }

  public async deleteToken(id: number): Promise<boolean> {
    await this.repository.delete(id)

    return true
  }

  public generateUniqueToken(): string {
    const tokenUniquePart = uuid().replace(/\-/g, '')
    const token = randomHex.sync(tokenUniquePart.length)

    return tokenUniquePart.concat(token)
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

La méthode `getToken()`, par le biais d'un repository, récupère l'entité Token qui correspond au jeton passé en paramètre. Cette méthode sera utilisée par la stratégie d'authentification.

### La stratégie d'authentification

La stratégie sera appelé par un décorateur [`@guard`](https://docs.nestjs.com/guards) placé sur les méthodes des contrôleurs que l'on souhaite rendre accessibles uniquement aux utilisateurs identifiés.

Générons notre stratégie :

```bash
$ nest generate class auth/strategy/defaultStrategy
```

{% code-tabs %}
{% code-tabs-item title="src/auth/strategy/default.ts" %}
```typescript
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';

import { TokenService } from '@auth/service/token.service';
import { UserService } from '@user/user.service';

@Injectable()
export class DefaultStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {
    super()
  }

  async validate(tokenString: string) {
    const token = await this.tokenService.getToken(tokenString)
    const tokenValidityDuration = Number(process.env.API_TOKEN_TTL)

    if (token === undefined) {
      throw new UnauthorizedException()
    }

    if (new Date(token.tokenDate).getTime() + tokenValidityDuration < new Date().getTime()) {
      throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED)
    }

    // Fetch user corresponding to token
    const user = await this.userService.getUserByToken(token)
    
    return user
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

C'est cette stratégie qui sera appelée lorsque l'on rajoutera un [Guard](https://docs.nestjs.com/guards) sur une méthode de contrôleur.

### Le contrôleur

Le contrôleur exposera 3 méthodes :

* Demande de jeton `POST:/auth/token`.
* Rafraîchissement de jeton `PUT:/auth/refresh`.
* Invalidation de jeton `DELETE:/auth/invalidate`.

On génère un contrôleur :

```bash
$ nest generate controller auth/controller/token
```

{% code-tabs %}
{% code-tabs-item title="src/auth/controller/token.controller.ts" %}
```typescript
import { Controller, Body, HttpException, HttpStatus, Post, Put, Req, Delete, UseGuards, Get } from '@nestjs/common';

import { Token } from '@auth/entity/token.entity';
import { TokenService } from '@auth/service/token.service';
import { RequestTokenDto } from '@auth/dto/request-token.dto';
import { UserService } from '@user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@user/entity/user.entity';

@Controller('auth')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) { }

  @Post('token')
  public async token(
    @Body() requestTokenDto: RequestTokenDto
  ): Promise<Token> {
    const user = await this.userService.getUserByUsernameAndPassword(
      requestTokenDto.username,
      requestTokenDto.password,
    )

    if (!user) {
      throw new HttpException('Invalid username and/or password', HttpStatus.UNAUTHORIZED)
    }

    const token = await this.tokenService.createToken(user)

    await this.userService.updateUser(user)
    
    return token
  }

  @UseGuards(AuthGuard())
  @Put('refresh')
  public async refresh(
    @Req() request: any
  ): Promise<Token> {
    const token = await this.tokenService.createToken(request.user)

    await this.userService.updateUser(request.user)

    return token
  }

  @UseGuards(AuthGuard())
  @Delete('invalidate')
  public async invalidate(
    @Req() request: any
  ):Promise<boolean> {
    const token = request.user.token

    return await this.tokenService.deleteToken(token.id)
  }

  @Get()
  public async createDummyUser(): Promise<User> {
    return await this.userService.createDummyUser()
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="info" %}
On passera les générations des DTOs afin de ne pas alourdir cette partie.
{% endhint %}



