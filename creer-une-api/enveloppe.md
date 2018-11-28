---
description: Normaliser les échanges avec l'API
---

# Enveloppe

{% hint style="danger" %}
Article en cours de rédaction
{% endhint %}

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

## Définition des DTOs

Nous venons de distinguer 3 cas à gérer. Nous allons donc créer 3 modèles couvrant ces cas.

### L'enveloppe principale

### La pagination

### Les erreurs et exceptions

