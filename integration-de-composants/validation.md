---
description: Validation des modèles de transfert
---

# Validation

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

### Validation

Basé sur le composant [class-validator](https://github.com/typestack/class-validator), un Pipe prêt à l'emploi est intégrable à toute l'application afin de permettre une validation de tout objet utilisant les [décorateurs de validation](https://github.com/typestack/class-validator#validation-decorators).

Installation du package de validation \(ainsi que le package de transformation de classe\):

```bash
$ npm i --save class-validator class-transformer
```

On va appliquer la validation de façon générale à l'application, cela évitera d'éventuels oublis et limitera la quantité de décorateur sur des méthodes de contrôleur ou de services.

{% code-tabs %}
{% code-tabs-item title="src/main.ts" %}
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true // When validating DTO, force transformation of data into a DTO class
    })  
  )

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

dotenv.config(); // Load configuration before bootstrapping

bootstrap();
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Créons un [DTO](https://fr.wikipedia.org/wiki/Objet_de_transfert_de_donn%C3%A9es) qui sera validé lors du traitement de la requête :

```bash
$ nest generate class common/dto/createExampleDto
```

{% code-tabs %}
{% code-tabs-item title="src/common/dto/createExampleDto.ts" %}
```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateExampleDto {
  @IsEmail()
  public readonly email!: string

  @MinLength(3)
  @IsNotEmpty()
  public readonly name!: string
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Le validateur vérifiera que la propriété `email`est bien sous la forme d'un email \(il est possible de vérifier les MX via des options de configuration\), la propriété `name`sera validée si elle n'est pas vide et si la longueur de la chaîne n'est pas inférieure à 3 caractères.

Ajoutons à notre contrôleur basique une méthode qui va gérer la création d'une resource via la méthode http POST :

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateExampleDto } from '@common/dto/create-example-dto';

@Controller()
export class AppController {

  // [...]

  @Post()
  displayName(
    @Body() createExampleDto: CreateExampleDto
  ): CreateExampleDto {
    return createExampleDto;
  }
}
```

Testons notre DTO et sa validation :

```bash
$ curl -d '{"email":"email@email.org","name":"Nest"}' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/

{"email":"email@email.org","name":"Nest"}
```

Avec des données erronées :

```bash
curl -d '{"email":"not an email","name":""}' \
-H "Content-Type: application/json" \
-X POST http://localhost:3000/

{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "target": {
        "email": "not an email",
        "name": ""
      },
      "value": "not an email",
      "property": "email",
      "children": [],
      "constraints": {
        "isEmail": "email must be an email"
      }
    },
    {
      "target": {
        "email": "not an email",
        "name": ""
      },
      "value": "",
      "property": "name",
      "children": [],
      "constraints": {
        "isNotEmpty": "name should not be empty",
        "minLength": "name must be longer than or equal to 3 characters"
      }
    }
  ]
}
```

