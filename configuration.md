---
description: Configuration de l'application avec des composants utiles
---

# Configuration

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

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

_Mais tout ne se passe pas tout le temps comme prévu..._

{% hint style="success" %}
Pensez à faire des **builds de production** de temps en temps pour pouvoir traiter ce genre de problème au plus tôt dans votre processus de développement
{% endhint %}

#### Build de production

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

#### Tests

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

## Intégration de composants

### Webpack

[Webpack](https://webpack.js.org/) permet de compiler et déployer l'application de façon plus avancée qu'avec le [transpileur](https://fr.wiktionary.org/wiki/transpileur) \(tsc\) seul.

Une fonctionnalité très intéressante de webpack est le remplacement de module à chaud \([**HRM** _- Hot-Module Replacement_](https://docs.nestjs.com/techniques/hot-reload)\). Elle permet de compiler uniquement les modules ayant été modifiés et de les insérer à nouveau dans le processus du serveur en cours d'execution. Couplé au watching de webpack, il suffit de modifier un élément dans notre projet pour que le stricte nécessaire soit recompilé et publié, sans recompiler l'intégralité de l'application.

Installons webpack et quelques modules utiles :

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals tsconfig-paths-webpack-plugin
```

Créons le fichier de configuration de webpack :

{% code-tabs %}
{% code-tabs-item title="webpack.config.js" %}
```javascript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [{
      test: /.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()] // For custom paths
  },
  plugins: [new webpack.HotModuleReplacementPlugin()], // For HMR
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
  },
  node: {
    __dirname: true
  }
};
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Modifions notre point d'entrée afin de prendre en charge le remplacement de module à chaud :

```typescript
// On déclare une constante globale pour le support du HMR
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);

  // On rajoute le support du HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

Ajoutons au fichier `package.json` le script de démarrage de webpack :

{% code-tabs %}
{% code-tabs-item title="package.json" %}
```javascript
{
  "scripts": {
    "webpack": "webpack --config webpack.config.js",
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Maintenant, pour lancer notre serveur de déploiement, il faut exécuter dans un terminal dédié :

```bash
npm run webpack

> nest-tutorial@0.0.0 webpack /nest-tutorial/project
> webpack --config webpack.config.js


webpack is watching the files…

Hash: 92eee5cc06cff90a567d
Version: webpack 4.26.1
Time: 2352ms
Built at: 27/11/2018 10:02:27
                          Asset       Size  Chunks             Chunk Names
       dist/app.controller.d.ts  177 bytes          [emitted]
           dist/app.module.d.ts   35 bytes          [emitted]
          dist/app.service.d.ts   56 bytes          [emitted]
 dist/common/common.module.d.ts   38 bytes          [emitted]
dist/common/common.service.d.ts   39 bytes          [emitted]
                 dist/main.d.ts   11 bytes          [emitted]
     dist/user/user.module.d.ts   36 bytes          [emitted]
    dist/user/user.service.d.ts   37 bytes          [emitted]
                      server.js   42.9 KiB    main  [emitted]  main
Entrypoint main = server.js
[0] multi webpack/hot/poll?100 ./src/main.ts 40 bytes {main} [built]
[./node_modules/webpack/hot/log-apply-result.js] (webpack)/hot/log-apply-result.js 1.27 KiB {main} [built]
[./node_modules/webpack/hot/log.js] (webpack)/hot/log.js 1.11 KiB {main} [built]
[./node_modules/webpack/hot/poll.js?100] (webpack)/hot/poll.js?100 1.15 KiB {main} [built]
[./src/app.controller.ts] 1.44 KiB {main} [built]
[./src/app.module.ts] 1.27 KiB {main} [built]
[./src/app.service.ts] 883 bytes {main} [built]
[./src/common/common.module.ts] 976 bytes {main} [built]
[./src/common/common.service.ts] 851 bytes {main} [built]
[./src/main.ts] 977 bytes {main} [built]
[./src/user/user.module.ts] 831 bytes {main} [built]
[@nestjs/common] external "@nestjs/common" 42 bytes {main} [built]
[@nestjs/core] external "@nestjs/core" 42 bytes {main} [built]
```

Dans un autre terminal, lançons le serveur de développement :

```bash
npm run start

> nest-tutorial@0.0.0 start /nest-tutorial/project
> ts-node -r tsconfig-paths/register src/main.ts

[Nest] 16158   - 27/11/2018 à 10:05:30   [NestFactory] Starting Nest application...
[Nest] 16158   - 27/11/2018 à 10:05:30   [InstanceLoader] CommonModule dependencies initialized +9ms
[Nest] 16158   - 27/11/2018 à 10:05:30   [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 16158   - 27/11/2018 à 10:05:30   [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 16158   - 27/11/2018 à 10:05:30   [RoutesResolver] AppController {/}: +17ms
[Nest] 16158   - 27/11/2018 à 10:05:30   [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 16158   - 27/11/2018 à 10:05:30   [NestApplication] Nest application successfully started +1ms
```

Notre serveur est donc accessible \(curl [http://localhost:3000/](http://localhost:3000/)\) et webpack recompilera le nécessaire lors des changements dans nos modules.

### Dotenv

Le composant [dotenv](https://github.com/motdotla/dotenv) permet d'exploiter des fichiers de configuration définissant des variables d’environnement, généralement nommés `.env`, comme son nom l'indique.

// TODO: installation et usage.

### Validation

Basé sur le composant [class-validator](https://github.com/typestack/class-validator), un Pipe prêt à l'emploi est intégrable à toute l'application afin de permettre une validation de tout objet utilisant les [décorateurs de validation](https://github.com/typestack/class-validator#validation-decorators).

// TODO: Installation, déclaration globale et usage.

### TypeORM

Le composant d'[ORM](https://fr.wikipedia.org/wiki/Mapping_objet-relationnel) [TypeORM](http://typeorm.io) est l'un des ORMs les plus complets pour l’environnement node.js. Pour ceux qui connaissent [Doctrine](https://www.doctrine-project.org/projects/orm.html), l'ORM le plus connu pour php, vous ne serez pas trop dépaysés avec TypeORM.

// TODO: Installation, configuration + lien vers section dédiée.

