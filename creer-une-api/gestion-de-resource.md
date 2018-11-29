---
description: Création du tronc commun des éléments de l'API
---

# Gestion de resource

## Qu'est-ce qu'une resource ?

[Roy Thomas Fielding](https://www.ics.uci.edu/~fielding/), dans sa thèse « [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) » \([Chap. 5](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_2_1_1)\), décrit une resource comme étant :

> Any information that can be named can be a resource. \[...\] A resource is a conceptual mapping to a set of entities, not the entity that corresponds to the mapping at any particular point in time

**Traduction :** toute information qui peut être nommée peut être une resource. \[...\] Une resource est une représentation virtuelle d'un ensemble d'entité qui correspondent à cette représentation à un instant donné.

Donc oui, c'est plutôt vague et on peu à peu près tout définir comme étant une resource...

Prenons un exemple concret : La fameux **Blog** \(avec **Articles** et **Commentaires**\).

Nous avons 2 resources :

* Article
* Commentaire

{% hint style="warning" %}
La resource **Commentaire** est en réalité une **sous-resource** d'**Article**, puisqu'un commentaire n'a aucune pertinence s'il n'est pas rattaché à un article.
{% endhint %}

Donc la resource **Article** est l'entité **Article** + la **collection** de **Commentaire**.

L'API exposerai ces routes :

* `GET /articles/`
* `POST /articles/`
* `GET /articles/:id`
* `PUT /articles/:id`
* `DELETE /articles/:id`
* `POST /articles/:id/comment`
* `PUT /articles/:id/comment/:comId`
* `DELETE /articles/:id/comment/:comId`

On voit clairement que la resource Commentaire est une sous-resource d'Article.

{% hint style="info" %}
On considérera qu'une resource est identifié par un champ commun à toutes les resources, mais dont la valeur est unique, dans le contexte de cette resource.
{% endhint %}

Plus concrètement, une resource aura un champ `id` de type `number` qui sera auto-généré par la base de donnée.

## L'écosystème d'une resource

Seule, la Resource n'est pas très utile. Pour vivre, la Resource doit être gérée.

Pour cela, il existe un patron de conception très connu : le [Repository pattern](https://medium.com/@pererikbergman/repository-design-pattern-e28c0f3e4a30).

Pour toute resource, elle est obligatoirement accompagnée d'un dépôt. C'est ce dépôt qui joue le rôle de **DAO** _\(Data Access Objects\)_ et gère la persistance d'une resource.

Notre dépôt se chargera, entre autre, de récupérer une resource ou une collection de resource \(selon nos besoins\). Lorsque nous allons récupérer une collection de resource, nous allons mettre en place le système de pagination.

Nous allons donc créer un décorateur \(au sens patron de conception\) pour notre collection de resource.

On retient :

* Une Resource: **Resource**
* Un Dépôt: **ResourceRepository**
* Une Pagination pour les collections: **PaginatedResources**

## Définir un contrat

Nous allons donc mettre en place un système permettant de marquer des entités comme des resources.

Pour ce faire, on va utiliser les interfaces, qui sont faites pour ce genre de cas.

![Diagramme de classe d&apos;une resource et de son &#xE9;cosyst&#xE8;me](../.gitbook/assets/resources.svg)

{% hint style="info" %}
Ce diagramme de classe à été réalisé avec [UMLet](https://www.umlet.com/).
{% endhint %}

Nos interfaces sont définies, voyons un exemple avec le couple Article et Commentaire :

![](../.gitbook/assets/resources-implement.svg)

{% hint style="info" %}
L'interface **PaginatedResources** est mise de côté pour simplifier l'article
{% endhint %}

## Création des modèles

### Resource

{% code-tabs %}
{% code-tabs-item title="src/common/api/resource/resource.interface.ts" %}
```typescript
export interface Resource {}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### ResourceRepository

{% code-tabs %}
{% code-tabs-item title="src/common/api/resource/resource-repository.interface.ts" %}
```typescript
import { Resource } from "@common/api/resource/resource.interface";
import { PaginatedResources } from "@common/api/resource/paginated-resources";

export interface ResourceRepository {
  /**
   * Finds a resource by its id
   *
   * @param {number} id
   * 
   * @returns {(Promise<Resource | undefined>)}
   */
  findOneById(id: number): Promise<Resource | undefined>

  /**
   * Performs a paginated query
   *
   * @param {*} criteria
   * @param {PaginationData} paginationData
   * 
   * @returns {Promise<PaginatedResources>}
   */
  findByPaginated(criteria: any, paginationData: PaginationData): Promise<PaginatedResources>
}

export interface PaginationData {
  /**
   * { field: 'ASC|DESC' }
   *
   * @type {*}
   */
  order: any
  offset: number
  limit: number
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Implémentations

Nous allons réaliser des implémentations de base pour couvrir les besoins minimaux.

### AbstractResource

{% code-tabs %}
{% code-tabs-item title="src/common/api/resource/abstract-resource.ts" %}
```typescript
import { Resource } from "@common/api/resource/resource.interface";
import { PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractResource implements Resource {

  /**
   * The resource's unique identifier
   *
   * @type {number}
   */
  @PrimaryGeneratedColumn()
  protected id!: number
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Toutes nos resources auront un identifiant unique avec valeur auto générée. Cette génération est réalisée par TypeORM grâce au décorateur `@PrimaryGeneratedColumn`.

### PaginatedResources

{% code-tabs %}
{% code-tabs-item title="src/common/api/resource/paginated-resources.ts" %}
```typescript
import { Resource } from "@common/api/resource/resource.interface";

export class PaginatedResources {
  public resources: Array<Resource> = []
  public page: number = 1
  public nbPages: number = 1
  public nbResults: number = 0
  public nbResultsPerPage: number = Number(process.env.PAGINATION_DEFAULT_LIMIT)

  constructor(
    resources: Array<Resource>,
    page: number,
    nbPages: number,
    nbResults: number,
    nbResultsPerPage: number
  ) {
    this.resources = resources
    this.page = page
    this.nbPages = nbPages
    this.nbResults = nbResults
    this.nbResultsPerPage = nbResultsPerPage
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Cette classe va permettre de transporter les informations de pagination pour l'enveloppe de l'API \(voir section suivante\).

### AbstractResourceRepository

{% code-tabs %}
{% code-tabs-item title="src/common/api/resource/abstract-resource-repository.ts" %}
```typescript
import { Repository } from "typeorm";
import { ResourceRepository, PaginationData } from "@common/api/resource/resource-repository.interface";
import { Resource } from "@common/api/resource/resource.interface";
import { PaginatedResources } from "@common/api/resource/paginated-resources";

export abstract class AbstractResourceRepository<T extends Resource> implements ResourceRepository {

  constructor(
    protected repository: Repository<T>
  ) { }

  public async findOneById(id: number): Promise<T | undefined> {
    return this.repository.findOne({ where: { id: id }})
  }

  public async findByPaginated(criteria: any, paginationData: PaginationData): Promise<PaginatedResources> {
    const queryParameters = {
      where: criteria,
      order: paginationData.order,
      skip: paginationData.offset,
      take: paginationData.limit
    }

    const resourcesCount = await this.countResource(criteria)

    let totalPageNumber = Math.ceil(resourcesCount / (paginationData.limit))
    let currentPageNumber = paginationData.limit
    let offset = (currentPageNumber - 1) * paginationData.limit

    // Handle the case when the asked page is greater than number of pages
    if (offset > (totalPageNumber - 1) * paginationData.limit) {
      offset = (totalPageNumber - 1) * paginationData.limit
      currentPageNumber = totalPageNumber
    }

    const resources = await this.repository.find(queryParameters)

    return new PaginatedResources(
      resources,
      resourcesCount,
      totalPageNumber,
      currentPageNumber,
      paginationData.limit
    )
  }

  /**
   * Perform a count query with given criteria
   *
   * @param {*} criteria
   * 
   * @returns {Promise<number>}
   */
  private async countResource(criteria: any): Promise<number> {
    const { resourcesCount } = await this.repository
      .createQueryBuilder("r")
      .select("COUNT(*)", "resourcesCount")
      .where(criteria)
      .getRawOne()

    return resourcesCount
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Conclusion

Désormais, pour chaque resource de notre API, nous pourrons étendre un repository pour bénéficier des méthodes de pagination et de récupération avec un identifiant. 

