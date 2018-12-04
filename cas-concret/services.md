---
description: Services gérants les resources utilisateur
---

# \[WIP\] Services

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

## Fonctionnalités

Nous allons avoir besoin de plusieurs services afin que notre gestion utilisateur fonctionne.

* Un service de gestion des mots de passe
  * Hasher les mots de passe
  * Vérifier la correspondance d'un mot de passe avec un hash donné
* Un service de gestion de la réinitialisation de mot de passe
  * Générer un jeton de réinitialisation
  * Récupérer un utilisateur à partir d'un jeton de réinitialisation
* Un service de gestion d'utilisateur
  * Récupérer un utilisateur à partir de son nom d'utilisateur et de son mot de passe
  * Récupérer un utilisateur à partir d'un jeton d'authentification
  * Gérer la mise à jour du mot de passe

### Gestion des mots de passe

Nous allons utiliser la bibliothèque [bcrypt](https://www.npmjs.com/package/bcrypt) qui permettra le hashage des mots de passe en utilisant un algorithme robuste.

```bash
$ npm install bcrypt @types/bcrypt --save
```

Générons notre service dans le module `@user`:

```bash
$ nest generate service user/service/passwordEncoder --flat
```

{% code-tabs %}
{% code-tabs-item title="src/user/service/password-encoder.service.ts" %}
```typescript
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
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Nous avons créé 2 méthodes, l'une hashant une chaîne de caractères avec l'ajout d'un salt, l'autre comparant une chaîne de caractères à un hash donné.

La première va être utilisée lors de la création d'un utilisateur et lors de sa mise à jour.

La seconde, quant à elle, sera utilisée lors de l'identification d'un utilisateur \(`POST /auth/token`\).

### Gestion de la réinitialisation de mot de passe

Pour la génération du jeton de réinitialisation, nous allons utiliser le service du module `@auth`, particulièrement la méthode `generateUniqueToken()`.

Générons notre service :

```bash
$ nest generate service user/service/resetPassword --flat
```

{% code-tabs %}
{% code-tabs-item title="src/user/service/reset-password.service.ts" %}
```typescript
import { Injectable } from '@nestjs/common';
import { User } from '@user/entity/user.entity';
import { ResetPasswordToken } from '@user/entity/reset-password-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from '@auth/service/token.service';
import { UserService } from '@user/user.service';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(ResetPasswordToken)
    private readonly repository: Repository<ResetPasswordToken>,
    private readonly authTokenService: TokenService,
    private readonly userService: UserService
  ) { }

  /**
   * Creates a password reset token
   * 
   * @returns {Promise<ResetPasswordToken>}
   */
  public async createResetPasswordToken(): Promise<ResetPasswordToken> {
    const token = await this.repository.create()

    token.token = this.authTokenService.generateUniqueToken()

    return this.repository.save(token)
  }

  /**
   * Creates a token for given user
   *
   * @param {User} user
   * 
   * @returns {Promise<User>}
   */
  public async createResetPasswordTokenForUser(user: User): Promise<User> {
    const token = await this.createResetPasswordToken()

    user.ResetPasswordToken = token

    await this.userService.updateUser(user)

    return user
  }

  /**
   * Fetches a ResetPasswordToken that matches the given token
   *
   * @param {string} token
   * 
   * @returns {(Promise<ResetPasswordToken | undefined>)}
   */
  public async findUserByResetPasswordToken(token: string): Promise<ResetPasswordToken | undefined> {
    return await this.repository.findOne(
      { token: token },
      { relations: ['user'] }
    )
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="info" %}
Toujours afin de simplifier l'exemple, nous ne gérerons pas une durée de validité ni la vérification de l’existence d'un jeton de réinitialisation.
{% endhint %}

// TODO : Blabla sur l'injection de dépendances.

// TODO : Blabla sur les dépendances circulaires \(AuthModule &lt;&gt; UserModule + forwardRef\(\)\)

### Gestion des utilisateurs

// TODO

