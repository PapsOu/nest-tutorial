---
description: Configuration de l'application avec des composants utiles
---

# Configuration

## Configuration Typescript

### Custom paths

Par défaut, Typescript réalise des imports par le biais d'imports relatifs :

```typescript
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
```

Lorsqu'un projet prend de l'ampleur et à une organisation en dossier relativement profonde, les imports deviennent compliqués à comprendre du premier coup d’œil :

```typescript
import { DefaultHeaders } from "../../../common/constants/http";
```

Pour se faire, Typescript propose un mécanisme d'alias, permettant, à la façon de namespace, d'organiser le nommage des chemin d'accès vers nos modules et les éléments les constituants. Il s'agit du paramètre `paths` disponible dans la configuration des options du compilateur `compilerOptions,` définis dans le fichier `tsconfig.json` .

{% code-tabs %}
{% code-tabs-item title="tsconfig.json" %}
```javascript
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@common/*": [
        "common/*"
      ],
      "@user/*": [
        "user/*"
      ]
    }
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Ce qui permet de faire des imports plus propres et dont on comprend immédiatement à quel module ils font référence :

```typescript
import { CommonModule } from '@common/common.module';
import { UserModule } from '@user/user.module';
```

### Build de production

Si on tente de compiler l'application en mode production `npm run start:prod`, nous avons le droit à une erreur :

```bash
$ npm run start:prod

> nest-tutorial@0.0.0 prestart:prod /nest-tutorial/project
> rimraf dist && tsc


> nest-tutorial@0.0.0 start:prod /nest-tutorial/project
> node dist/main.js

internal/modules/cjs/loader.js:582
    throw err;
    ^

Error: Cannot find module '@common/common.module'
```

En effet, node.js recherche un module nommé `@common` dans le dossier `node_modules`, mais il se trouve dans `src/`.

Pour corriger ce problème, il faut utiliser le module [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths) afin de transcrire les imports dans un format géré par node.js.

{% hint style="info" %}
Pas besoin d'installer le package `$ npm i sconfig-paths` car Nest l'utilise déjà.
{% endhint %}

Il faut créer un fichier `tsconfig-paths-bootstrap.js` qui se chargera de traduire les custom paths pour node.js.

{% code-tabs %}
{% code-tabs-item title="tsconfig-paths-bootstrap.js" %}
```typescript
const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './dist',
  paths: tsConfig.compilerOptions.paths
});
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Modifions notre fichier `package.json` afin d'intégrer tsconfig-paths lors de la construction de production.

{% code-tabs %}
{% code-tabs-item title="package.json" %}
```javascript
"scripts": {
  "start": "ts-node -r tsconfig-paths/register src/main.ts",
  "start:prod": "node dist/main.js",
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

On peut voir que le script `start` utilise déjà tsconfig-paths, mais pas sa version `:prod`. On va faire de même pour le script de production :

{% code-tabs %}
{% code-tabs-item title="package.json" %}
```javascript
"scripts": {
  "start:prod": "node -r ./tsconfig-paths-bootstrap.js dist/main.js",
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Maintenant, lorsque nous lançons le build de prod, tout fonctionne :

```bash
> nest-tutorial@0.0.0 prestart:prod /nest-tutorial/project
> rimraf dist && tsc


> nest-tutorial@0.0.0 start:prod /nest-tutorial/project
> node -r ./tsconfig-paths-bootstrap.js dist/main.js

[Nest] 10849   - 27/11/2018 à 09:22:21   [NestFactory] Starting Nest application...
[Nest] 10849   - 27/11/2018 à 09:22:21   [InstanceLoader] CommonModule dependencies initialized +9ms
[Nest] 10849   - 27/11/2018 à 09:22:21   [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 10849   - 27/11/2018 à 09:22:21   [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 10849   - 27/11/2018 à 09:22:21   [RoutesResolver] AppController {/}: +17ms
[Nest] 10849   - 27/11/2018 à 09:22:21   [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 10849   - 27/11/2018 à 09:22:21   [NestApplication] Nest application successfully started +2ms
```

{% hint style="success" %}
Pensez à faire des **builds de production** de temps en temps pour pouvoir traiter ce genre de problème au plus tôt dans votre processus de développement
{% endhint %}

### Tests unitaires et e2e

[Jest](https://jestjs.io/en/) rencontrera le même problème que pour le cas précédent :

{% code-tabs %}
{% code-tabs-item title="src/common/common.service.spec.ts" %}
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@common/common.service';

describe('CommonService', () => {
  // [...]
});
```
{% endcode-tabs-item %}
{% endcode-tabs %}

```bash
$ npm run test

> nest-tutorial@0.0.0 test /home/papsou/Documents/Perso/Tuto/nest-tutorial/project
> jest

 FAIL  src/common/common.service.spec.ts
  ● Test suite failed to run

    Cannot find module '@common/common.service' from 'common.service.spec.ts'

      1 | import { Test, TestingModule } from '@nestjs/testing';
    > 2 | import { CommonService } from '@common/common.service';
        | ^
      3 |
      4 | describe('CommonService', () => {

      at Resolver.resolveModule (../node_modules/jest-resolve/build/index.js:221:17)
      at Object.<anonymous> (common/common.service.spec.ts:2:1)
```

Il faut donc configurer jest pour qu'il convertisse également les customs paths lors de l'exécution des tests à l'aide de l'option [moduleNameMapper](https://jestjs.io/docs/en/configuration.html#modulenamemapper-object-string-string).

{% code-tabs %}
{% code-tabs-item title="package.json" %}
```javascript
"jest": {
    "moduleNameMapper": {
      "@common/(.*)": "<rootDir>/src/common/$1",
      "@user/(.*)": "<rootDir>/src/user/$1"
    },
    "rootDir": ".",
  }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Maintenant les tests \(unitaires et end-to-end\) passent correctement :

```bash
$ npm run test

> nest-tutorial@0.0.0 test /home/papsou/Documents/Perso/Tuto/nest-tutorial/project
> jest

 PASS  src/common/common.service.spec.ts
 PASS  test/app.e2e-spec.ts

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.357s, estimated 3s
Ran all test suites.
```

### 

### 



