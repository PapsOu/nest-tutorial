---
description: Intégration d'un ORM
---

# TypeORM

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

### TypeORM

Le composant d'[ORM](https://fr.wikipedia.org/wiki/Mapping_objet-relationnel) [TypeORM](http://typeorm.io) est l'un des ORMs les plus complets pour l’environnement node.js. Pour ceux qui connaissent [Doctrine](https://www.doctrine-project.org/projects/orm.html), l'ORM le plus connu pour php, vous ne serez pas trop dépaysés avec TypeORM.

On ne va pas entrer dans les détails de TypeORM maintenant, mais on va juste s'attarder sur la configuration et l'[intégration avec Nest](https://docs.nestjs.com/techniques/database).

```bash
$ npm install --save @nestjs/typeorm typeorm sqlite3
```

Puis on configure Nest pour accéder à la base de donnée :

{% code-tabs %}
{% code-tabs-item title="src/app.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: `${__dirname}/../db/db.sqlite`,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Will fail with webpack
      synchronize: true,
      keepConnectionAlive: true // Allows using the same connection between reloads with webpack
    }),
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
{% endcode-tabs-item %}
{% endcode-tabs %}

On créé une entité pour servir d'exemple :

{% code-tabs %}
{% code-tabs-item title="src/user/entity/user.entity.ts" %}
```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number
  
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
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

On déclare notre entité dans le module \(dans notre exemple le module utilisateur\) en utilisant la méthode `TypeOrmModule.forFeature()`.

{% code-tabs %}
{% code-tabs-item title="src/user/user.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ]
})
export class UserModule { }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

On adapte la configuration de la base de donnée afin de définir explicitement nos entités en retirant la condition d'identification d'entité `entities: [__dirname + '/*/.entity{.ts,.js}'],` et en ajoutant manuellement chaque nouvelle entité.

{% code-tabs %}
{% code-tabs-item title="src/app.module.ts" %}
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    // [...]
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        // [...]
        entities: [
          User
        ],
      })
    }),
  ],
})
export class AppModule { }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="info" %}
Grâce à l'option `synchronize: true`, le schema de la base de donnée est maintenu synchronisé lors des changements du mapping ORM \(ajout d'entité, modification des champs, etc.\)
{% endhint %}

