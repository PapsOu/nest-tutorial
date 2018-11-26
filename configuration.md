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
import Entry from "./components/Entry";
```

Lorsqu'un projet prend de l'ampleur et à une organisation en dossier relativement profonde, les imports deviennent compliqués à comprendre du premier coup d’œil :

```typescript
import { DefaultHeaders } from "../../../common/constants/http";
```

Pour se faire, Typescript propose un mécanisme d'alias, permettant, à la façon de namespace, d'organiser le nommage des chemin d'accès vers nos modules et les éléments les constituants. Il s'agit du paramètre `paths` disponible dans la configuration des options du compilateur `compilerOptions,` définis dans le fichier `tsconfig.json` .

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

Ce qui permet de faire des imports plus propres et dont on comprend immédiatement à quel module ils font référence :

```typescript
import Entry from "@user/components/Entry";
import { DefaultHeaders } from "@common/constants/http";
```

_Mais tout ne se passe pas tout le temps comme prévu..._

{% hint style="danger" %}
Pour **Webpack**, les **tests** et les **builds de production**, les choses se compliquent !
{% endhint %}

#### Webpack

// TODO: utilisation du composant `tsconfig-paths-webpack-plugin`, configuration de `webpack.config.js`.

#### Production

// TODO: utilisation du composant `tsconfig-paths`, configuration de `package.json`.

#### `Tests`

// TODO: configuration de `package.json`côté jest.

## Intégration de composants

### Webpack

[Webpack](https://webpack.js.org/) permet de compiler et déployer l'application de façon plus poussée qu'uniquement avec le transcompilateur Typescript \(`tsc`\).

Une fonctionnalité très intéressante de webpack est le remplacement de module à chaud \(HRM - Hot-Module Replacement\). Elle permet de compiler uniquement les modules ayant été modifiés et de les insérer à nouveau dans le processus du serveur en cours d'execution. Couplé au watching de webpack, il suffit de modifier un élément dans notre projet pour que le stricte nécessaire soit recompilé et publié, sans recompiler l'intégralité de l'application.

// TODO: config webpack.

### Dotenv

Le composant [dotenv](https://github.com/motdotla/dotenv) permet d'exploiter des fichiers de configuration définissant des variables d’environnement, généralement nommés `.env`, comme son nom l'indique.

// TODO: installation et usage.

### Validation

Basé sur le composant [class-validator](https://github.com/typestack/class-validator), un Pipe prêt à l'emploi est intégrable à toute l'application afin de permettre une validation de tout objet utilisant les [décorateurs de validation](https://github.com/typestack/class-validator#validation-decorators).

// TODO: Installation, déclaration globale et usage.

### TypeORM

Le composant d'[ORM](https://fr.wikipedia.org/wiki/Mapping_objet-relationnel) [TypeORM](http://typeorm.io) est l'un des ORMs les plus complets pour l’environnement node.js. Pour ceux qui connaissent [Doctrine](https://www.doctrine-project.org/projects/orm.html), l'ORM le plus connu pour php, vous ne serez pas trop dépaysés avec TypeORM.

// TODO: Installation, configuration + lien vers section dédiée.

