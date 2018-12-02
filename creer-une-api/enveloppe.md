---
description: Normaliser les échanges avec l'API
---

# Enveloppe

## Objectif

L'objectif d'une enveloppe d'API est de normaliser son format de réponse.

Grâce à cela, les consommateurs de l'API auront l'assurance d'avoir une structure de réponse uniforme et pourront interpréter les résultats de façon homogène et maîtrisée.

Notre enveloppe va devoir gérer les cas suivants :

* Une seule resource
* Plusieurs resources avec pagination
* Les exceptions et erreurs

Pour ces 3 cas, il faudra présenter un format de donnée cohérent.

Par exemple, dans le cas d'une erreur, nous allons afficher, dans le champ error, la représentation de l'erreur. Le champ des données, quant à lui, sera null.

{% hint style="warning" %}
Une erreur peut très bien être retournée par l'API avec un code HTTP 200, dans le cas, par exemple, d’erreurs métier gérées par le backend.

Il faut donc que les clients puissent détecter la présence d'une erreur sans se baser uniquement sur le status HTTP.
{% endhint %}

Nous allons implémenter cette enveloppe dans le module `@common`.

## Définition des DTO

Nous venons de distinguer 3 cas à gérer. Nous allons donc créer 3 modèles couvrant ces cas.

### L'enveloppe principale

L'enveloppe principale possède 3 champs : `data`, `pagination`, `errors`.

Générons le DTO dans le module `@common`:

```bash
$ nest generate class common/api/dto/envelope
```

{% code-tabs %}
{% code-tabs-item title="src/common/api/dto/envelope.dto.ts" %}
```typescript
import { PaginationEnvelope } from "@common/api/dto/pagination-envelope.dto";
import { ErrorEnvelope } from "@common/api/dto/error-envelope.dto";

export class Envelope {

  /**
   * The response payload
   *
   * @type {(Array<any> | any | null)}
   */
  public data: Array<any> | any | null = null

  /**
   * The response pagination
   *
   * @type {(PaginationEnvelope | null)}
   */
  public pagination: PaginationEnvelope | null = null

  /**
   * The response errors
   *
   * @type {(ErrorEnvelope | null)}
   */
  public error: ErrorEnvelope | null = null

  /**
   * Sets a single resource
   *
   * @param {*} resource
   */
  public setData(resource: any): void {
    this.data = resource
  }

  /**
   * Sets pagination
   *
   * @param {PaginationEnvelope} pagination
   */
  public setPagination(pagination: PaginationEnvelope): void {
    this.pagination = pagination
  }

  /**
   * Sets error
   *
   * @param {ErrorEnvelope} error
   */
  public setError(error: ErrorEnvelope): void {
    this.error = error
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### La pagination

La pagination doit exposer 4 informations :

* Le numéro de page courant
* Le nombre total de page
* Le nombre total de résultats
* Le nombre de résultats par page

Générons le DTO :

```bash
$ nest generate class common/api/dto/pagination
```

{% code-tabs %}
{% code-tabs-item title="src/common/api/dto/pagination-envelope.dto.ts" %}
```typescript
export class PaginationEnvelope {

  /**
   * Current page number
   *
   * @type {number}
   */
  public page: number = 1

  /**
   * Total number of pages
   *
   * @type {number}
   */
  public nbPages: number = 1

  /**
   * Total number of results
   *
   * @type {number}
   */
  public nbResults: number = 1

  /**
   * Number of results per page
   *
   * @type {number}
   */
  public nbResultsPerPage: number = Number(process.env.PAGINATION_DEFAULT_LIMIT)
  
  constructor(
    page: number,
    nbPages: number,
    nbResults: number,
    nbResultsPerPage: number
  ) {
    this.page = page
    this.nbPages = nbPages
    this.nbResults = nbResults
    this.nbResultsPerPage = nbResultsPerPage
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### Les erreurs et exceptions

Lors d'exception, nous afficherons le message, le code, les données spécifiques et la trace de la pile \(uniquement en environnement de développement\).

Générons le DTO :

```bash
$ nest generate class common/api/dto/errors
```

{% code-tabs %}
{% code-tabs-item title="src/common/api/dto/error-envelope.dto.ts" %}
```typescript
import { HttpStatus } from "@nestjs/common";

export class ErrorEnvelope {

  /**
   * The error / exception message
   *
   * @type {string}
   */
  public message: string = 'An error occurred'

  /**
   * The error / exception code
   *
   * @type {number}
   */
  public code: number

  /**
   * The optional specific data
   *
   * @type {*}
   */
  public data: any

  /**
   * The error / exception stacktrace (for dev env)
   *
   * @type {*}
   */
  public trace: any

  constructor(
    message: string,
    code?: number,
    data?: any,
    trace?: any
  ) {
    this.message = message
    this.code = code ? code : HttpStatus.INTERNAL_SERVER_ERROR
    this.data = data
    this.trace = trace
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Nous avons fait nos DTO pour les réponses de l'API.

## Format de l'enveloppe

Les réponses auront cette structure json selon les différents cas identifiés au début de cette section :

#### Une seule resource

```javascript
{
  "data": {
    "id": 1,
    "name": "A single resource"
  },
  "pagination": null,
  "error": null
}
```

#### Plusieurs resources avec pagination

```javascript
{
  "data": [{
    "id": 1,
    "name": "Many resources"
  },{
    "id": 2,
    "name": "Many resources"
  }],
  "pagination":{
    "page": 1
    "nbPages": 1
    "nbResults": 2
    "nbResultsPerPage": 50
  },
  "error": null
}
```

#### Erreurs et/ou exceptions

```javascript
{
  "data": null,
  "pagination": null,
  "error": {
    "message": "An error occurred",
    "code": 500,
    "data": null,
    "trace": {
      // An error stack
    }
  }
}
```

Nous voyons donc clairement les 3 formes particulières des réponses de notre API. Les clients se baseront donc sur ce format. 

{% hint style="success" %}
C'est un **contrat** passé entre l'**API** et leur **consommateurs**, qu'il faut décrire et maintenir.

Tout changement de structure sera considéré comme un changement majeur de l'API, et donc il faudra réaliser un saut de version majeure si, par exemple, des champs existants sont modifiés.
{% endhint %}

## Service de construction

Nous allons maintenant créer un service qui se chargera d'instancier notre enveloppe et d'y attacher les données.

Générons notre service :

```bash
$ nest generate service common/api/service/envelope --flat
```

Il possédera 3 méthodes publiques :

* `mapSingleResource`: intègre une simple resource dans l'envelope
* `mapMultipleResources`: intègre plusieurs resources dans l'envelope avec leur pagination
* `mapErrorOrException`: intègre une exception ou des erreurs dans l'envelope

{% code-tabs %}
{% code-tabs-item title="src/common/api/service/envelope.service.ts" %}
```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { Envelope } from '@common/api/dto/envelope.dto';
import { PaginatedResources } from '@common/api/resource/paginated-resources';
import { PaginationEnvelope } from '@common/api/dto/pagination-envelope.dto';
import { ErrorEnvelope } from '@common/api/dto/error-envelope.dto';

@Injectable()
export class EnvelopeService {

  public mapSingleResource(resource: any): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resource)

    return envelope
  }

  public mapMultipleResources(resources: PaginatedResources): Envelope {
    const envelope = this.getEnvelope()

    envelope.setData(resources.resources)

    envelope.setPagination(
      new PaginationEnvelope(
        resources.page,
        resources.nbPages,
        resources.nbResults,
        resources.nbResultsPerPage
      )
    )

    return envelope
  }

  public mapErrorOrException(error: Error|HttpException): Envelope {
    const envelope = this.getEnvelope()

    if (error instanceof HttpException) {
      envelope.setError(
        new ErrorEnvelope(
          error.message,
          error.getStatus(),
          error.name,
          error.stack
        )
      )
    } else {
      envelope.setError(
        new ErrorEnvelope(
          error.message,
          undefined,
          error.name,
          error.stack
        )
      )
    }

    return envelope
  }

  private getEnvelope(): Envelope {
    return new Envelope()
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Intercepter les réponses

Maintenant, il faut intercepter les réponses des contrôleurs afin de mapper les données dans l'enveloppe.

Nest propose un moyen d'[intercepter les réponses](https://docs.nestjs.com/interceptors) afin de les altérer à l'aide d'un service applicable à toutes les requêtes.

{% code-tabs %}
{% code-tabs-item title="src/common/api/interceptor/envelope-interceptor.ts" %}
```typescript
import { Injectable, NestInterceptor, ExecutionContext, HttpException } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { EnvelopeService } from "@common/api/service/envelope.service";
import { map, catchError } from 'rxjs/operators';
import { Envelope } from "@common/api/dto/envelope.dto";
import { PaginatedResources } from "@common/api/resource/paginated-resources";
import { Resource } from "@common/api/resource/resource.interface";
import { AbstractResource } from "@common/api/resource/abstract-resource";

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {

  constructor(
    private envelopeService: EnvelopeService
  ) { }

  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<Envelope> {
    return call$
      .pipe(
        catchError(err => {
          return throwError(
            new HttpException(
              this.mapDataToApiEnvelope(err),
              err.status
            )
          )
        }),
        map(data => this.mapDataToApiEnvelope(data))
      )
    }

    private mapDataToApiEnvelope(dataOrError: Resource | PaginatedResources | Error | any): Envelope | any {
      if (dataOrError instanceof PaginatedResources) {
        return this.envelopeService.mapMultipleResources(dataOrError)
      } else if (dataOrError instanceof Error) {
        return this.envelopeService.mapErrorOrException(dataOrError)
      }
      return this.envelopeService.mapSingleResource(dataOrError)
    }
  }
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Maintenant, on déclare l'intercepteur dans le point d'entrée de notre application

{% code-tabs %}
{% code-tabs-item title="src/main.ts" %}
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { EnvelopeInterceptor } from '@common/api/interceptor/envelope-interceptor';
import { EnvelopeService } from '@common/api/service/envelope.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true // When validating DTO, force transformation of data into a DTO class
    })
  )

  // Map all responses to the API envelope
  app.useGlobalInterceptors(
    new EnvelopeInterceptor(
      new EnvelopeService()
    )
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

Voila, toutes nos réponses seront maintenant affichées avec la structure de l'enveloppe API.

