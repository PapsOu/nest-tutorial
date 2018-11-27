---
description: Intégration de webpack pour le développement
---

# Webpack

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

{% code-tabs %}
{% code-tabs-item title="src/main.ts" %}
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
{% endcode-tabs-item %}
{% endcode-tabs %}

Ajoutons au fichier `package.json` le script de démarrage de webpack et modifions le script de lancement du serveur :

{% code-tabs %}
{% code-tabs-item title="package.json" %}
```javascript
{
  "scripts": {
    "webpack": "webpack --config webpack.config.js",
    "start": "node dist/server",
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

Si on modifie, par exemple, le module `@common/common.module.ts`, webpack va recompiler que ce module, le module principal `app.module.ts` et le point d'entrée `main.ts`:

```bash
                                  Asset      Size  Chunks             Chunk Names
   92eee5cc06cff90a567d.hot-update.json  46 bytes          [emitted]
                   dist/app.module.d.ts  35 bytes          [emitted]
         dist/common/common.module.d.ts  58 bytes          [emitted]
                         dist/main.d.ts  11 bytes          [emitted]
main.92eee5cc06cff90a567d.hot-update.js  1.48 KiB    main  [emitted]  main
                              server.js    43 KiB    main  [emitted]  main
Entrypoint main = server.js main.92eee5cc06cff90a567d.hot-update.js
[./src/app.module.ts] 1.27 KiB {main} [built]
[./src/common/common.module.ts] 1020 bytes {main} [built]
    + 11 hidden modules
```

Du côté du serveur, la liste des éléments qui ont été rechargés pendant l'exécution s'affiche et le log du serveur suit.

```bash
[Nest] 23373   - 27/11/2018 à 10:42:58   [NestFactory] Starting Nest application... +23246ms
[HMR] Updated modules:
[HMR]  - ./src/app.module.ts
[HMR]  - ./src/main.ts
[HMR]  - ./src/common/common.module.ts
[HMR] Update applied.
[Nest] 23373   - 27/11/2018 à 10:42:58   [InstanceLoader] CommonModule dependencies initialized +2ms
[Nest] 23373   - 27/11/2018 à 10:42:58   [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 23373   - 27/11/2018 à 10:42:58   [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 23373   - 27/11/2018 à 10:42:58   [RoutesResolver] AppController {/}: +0ms
[Nest] 23373   - 27/11/2018 à 10:42:58   [RouterExplorer] Mapped {/, GET} route +1ms
[Nest] 23373   - 27/11/2018 à 10:42:58   [NestApplication] Nest application successfully started +0ms
```

