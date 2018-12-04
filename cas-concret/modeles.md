---
description: Définition du modèle d'utilisateur et des modèles associés
---

# Modèles

## Définition

Comme exprimé dans les besoins, un utilisateur est définis par :

* Un identifiant unique
* Un nom d'utilisateur
* Un email \(pour la réinitialisation du mot de passe\)
* Un mot de passe

De plus, notre entité doit avoir un jeton d'identification pour être utilisé par notre module d'authentification d'API.

Rajoutons la relation au jeton du module d'authentification :

* Un jeton d'identification en OneToOne.

## Création

### Utilisateur

Créons notre entité :

```bash
$ nest generate class user/entity/user
```

{% code-tabs %}
{% code-tabs-item title="src/user/entity/user.entity.ts" %}
```typescript
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
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### Jeton de réinitialisation

Pour la gestion de la réinitialisation de mot de passe, nous allons faire une entité similaire à l'entité `Token`du module `@auth`.

{% hint style="info" %}
Afin de simplifier l'exemple, nous allons bêtement étendre la classe `Token`.

Dans un contexte normal, il aurait fallut en faire une entité dédiée, n’héritant pas du module `@auth`pour éviter qu'une évolution de l'authentification ne « casse » la réinitialisation des mots de passe du module `@user`.
{% endhint %}

{% hint style="warning" %}
On aurait pu interdire d'étendre la classe `Token`avec le mot clé [**final**](https://github.com/Microsoft/TypeScript/issues/8306), mais malheureusement, celui-ci n'existe pas encore à ce jour dans TypeScript. 
{% endhint %}

```bash
$ nest generate class user/entity/passwordResetToken
```

{% code-tabs %}
{% code-tabs-item title="src/user/entity/password-reset-token.entity.ts" %}
```typescript
import { Token } from "@auth/entity/token.entity";
import { Entity } from "typeorm";

@Entity()
export class PasswordResetToken extends Token { }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Cette entité sera générée lors de la demande de réinitialisation d'un mot de passe et utilisée \(puis supprimée\) lors de la réinitialisation effective du mot de passe.

## Mise à jour du schéma

TypeORM à une fonctionnalité intéressante pour le développement, qui permet de synchroniser le schema avec les entités définies dans notre application de façon automatique et transparente.

Dans notre module principal, nous avons activé cette fonctionnalité \(commentaire `// <-- ICI !`\):

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { ExampleModule } from '@example/example.module';
import { User } from '@user/entity/user.entity';
import { Token } from '@auth/entity/token.entity';
import { PasswordResetToken } from '@user/entity/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: `${__dirname}/../${process.env.DB_PATH}`,
        entities: [
          User,
          Token,
          PasswordResetToken
        ],
        synchronize: true, // <-- ICI !
        keepConnectionAlive: true // Allows using the same connection between reloads with webpack
      })
    }),
    AuthModule,
    CommonModule,
    UserModule,
    ExampleModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }

```

Il est possible \(et fortement conseillé\) de ne pas activer cette fonctionnalité et de favoriser l'utilisation des migrations, surtout lorsque vous travaillez sur un projet en équipe et qui devra se déployer facilement en production.

