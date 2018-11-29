---
description: Gestion des paramètres d'environnement
---

# Dotenv

### Dotenv

Le composant [dotenv](https://github.com/motdotla/dotenv) permet d'exploiter des fichiers de configuration définissant des variables d’environnement, généralement nommés `.env`, comme son nom l'indique _\(dot = point\)_.

Installons le package :

```bash
$ npm i --save dotenv
```

Créons notre fichier `.env`qui contiendra notre configuration sous forme de variables d'environnement :

{% code-tabs %}
{% code-tabs-item title=".env" %}
```bash
APP_NAME = "Nest application"
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Ensuite, il faut charger ces variables d'environnement. On peu le faire n'importe où, comme dans une classe dédiée au chargement et aux accès aux paramètres, ou bien plus simplement, dans le point d'entrée :

{% code-tabs %}
{% code-tabs-item title="src/main.ts" %}
```typescript
import * as dotenv from 'dotenv';

async function bootstrap() {
  // [...]
}

dotenv.config(); // Load configuration before bootstrapping

bootstrap();
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Maintenant, depuis n'importe quel élément de notre application, on accède à nos variables d'environnement de cette façon :

{% code-tabs %}
{% code-tabs-item title="src/app.service.ts" %}
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return process.env.APP_NAME ?
      process.env.APP_NAME :
      'No app name configured'
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="success" %}
Il est vivement conseillé de faire une classe de gestion de configuration afin de consolider l'accès aux variables d'environnement. Sur l'exemple précédent, nous devons vérifier l'existence de la variable manuellement, mais une classe gérant cela peut faciliter et consolider l'usage de ces variables d'environnement.
{% endhint %}

