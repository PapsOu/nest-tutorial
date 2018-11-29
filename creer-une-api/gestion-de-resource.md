---
description: Création du tronc commun des éléments de l'API
---

# Gestion de resource

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

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

### Interfaces

#### Resource

```bash
$ nest generate class common/api/resource/resource
```

// TODO : Continuer...

