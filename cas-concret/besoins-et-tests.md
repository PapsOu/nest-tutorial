---
description: Description des besoins et mise en place des stories + tests d'acceptance
---

# Besoins et tests

## Besoins

Nous allons réaliser une gestion utilisateur classique, dans le but de s'assurer que l'utilisation de certains points d'entrées de l'API soient uniquement réservés à des personnes authentifiées et possédant les droits nécessaires à ces actions.

L'API doit permettre les actions suivantes :

* Créer un utilisateur
* Afficher un utilisateur
* Modifier un utilisateur
* Supprimer un utilisateur
* Lister des utilisateurs
* Demander une réinitialisation de mot de passe
* Réinitialiser le mot de passe

{% hint style="info" %}
Nous ne ferons pas d'inscription utilisateur ni de gestion des droits d'accès pour simplifier cet exemple.
{% endhint %}

Toutes ces actions précédemment listées devrons être accessibles qu'aux utilisateurs identifiés, à l'exception de la demande de réinitialisation de mot de passe et de la réinitialisation effective du mot de passe.

## Méthode

Nous allons adopter un fonctionnement dit « [Agile](https://agiliste.fr/introduction-methodes-agiles/) », particulièrement avec [Scrum](https://agiliste.fr/guide-de-demarrage-scrum/).

## Nos stories

Rédigeons les [User Stories](https://www.mountaingoatsoftware.com/agile/user-stories) décrivant notre future gestion utilisateur.

### Créer un utilisateur

En tant qu'utilisateur authentifié, je veux créer un utilisateur à partir d'un nom d'utilisateur \(pseudo\), d'un email et d'un mot de passe, dans le but d'ajouter, via l'API, de nouveaux utilisateurs à l'application.

### Afficher un utilisateur

En tant qu'utilisateur authentifié, je veux afficher les informations d'un utilisateur à partir de son identifiant unique, dans le but de consulter son email et/ou son nom d'utilisateur.

### Modifier un utilisateur

En tant qu'utilisateur authentifié, je veux modifier un utilisateur existant, dans le but de corriger certaines informations qui auraient évoluées.

### Supprimer un utilisateur

En tant qu'utilisateur authentifié, je veux supprimer un utilisateur existant à partir de son identifiant unique, dans le but de retirer ses informations et ses accès à l'application.

### Lister les utilisateurs

En tant qu'utilisateur authentifié, je veux dresser la liste paginée des utilisateurs de l'application afin de pouvoir avoir une liste exhaustive des utilisateurs présents dans l'application.

### Demander une réinitialisation de mot de passe

En tant qu'utilisateur anonyme, je veux demander la réinitialisation de mon mot de passe à partir de mon adresse email afin, suite à un oubli, d'en redéfinir un nouveau.

### Réinitialiser le mot de passe

En tant qu'utilisateur anonyme, je veux redéfinir mon mot de passe à partir du lien reçu dans un email afin de finaliser la procédure de réinitialisation de mot de passe.

{% hint style="info" %}
Toujours pour des raisons de simplifications, nous n'allons pas réellement envoyer un email. À la place, nous afficherons un jeton de réinitialisation directement dans la réponse API de la demande.
{% endhint %}

{% hint style="danger" %}
Ce qui est à ne surtout pas faire sur une API réelle, car cela permettrai à un attaquant de s'approprier n'importe quel compte utilisateur en réinitialisant leur mot de passe à l'aide d'un email.
{% endhint %}

## Nos critères d'acceptation

Pour chaque story, décrivons les scenarii qui couvrent le besoin exprimé. Nous allons opter pour le langage [Gherkin](http://agileutile.fr/outils/gherkin-tests-acceptance/) qui est largement préconisé dans un cadre Agile.

### Créer un utilisateur

Étant donné que je suis connecté à l'API avec des identifiants valides

Quand je requête le point d'entrée de création d'utilisateur, que je fournis un nom d'utilisateur, une adresse email et un mot de passe dans le corps de ma requête

Alors j'obtiens un nouvel utilisateur persisté en base de données et j'obtiens également sa représentation en réponse de ma requête.

### Afficher un utilisateur

Étant donné que je suis connecté à l'API avec des identifiants valides

Quand je requête le point d'entrée de consultation d'utilisateur et que je fournis un identifiant unique existant

Alors j'obtiens la représentation de l'utilisateur correspondant à l'identifiant unique en réponse de ma requête.

### Modifier un utilisateur

Étant donné que je suis connecté à l'API avec des identifiants valides

Quand je requête le point d'entrée de modification d'utilisateur et que je fournis un identifiant unique existant et que je fournis un nouveau nom d'utilisateur dans le corps de ma requête

Alors j'obtiens la représentation de l'utilisateur correspondant à l'identifiant unique en réponse de ma requête et que le nom d'utilisateur est bien le nouveau nom que j'ai fournis précédemment.

### Supprimer un utilisateur

Étant donné que je suis connecté à l'API avec des identifiants valides

Quand je requête le point d'entrée de suppression d'utilisateur et que je fournis un identifiant unique existant

Alors j'obtiens une réponse m'indiquant que la suppression s'est correctement déroulée.

### Lister les utilisateurs

Étant donné que je suis connecté à l'API avec des identifiants valides

Quand je requête le point d'entrée de listing d'utilisateurs

Alors j'obtiens une réponse paginée comprenant la liste des utilisateurs présents dans l'application, le nombre de page disponibles, le nombre total d'utilisateurs et le nombre d'utilisateur par page.

### Demander une réinitialisation de mot de passe

Étant donné que je possède un compte sur l'application et que j'ai en ma possession l'adresse email de ce compte

Quand je requête le point d'entrée de demande de réinitialisation de mot de passe et que je fournis l'adresse email dans le corps de la requête

Alors j'obtiens une réponse m'indiquant que l'email de réinitialisation à bien été envoyé sur mon adresse email donnée

{% hint style="success" %}
Pour notre cas, il n'y aura pas d'email. Donc le résultat attendu est le suivant :

_Alors j'obtiens une réponse m'indiquant le jeton de réinitialisation que je conserverai pour réinitialiser mon mot de passe._
{% endhint %}

### Réinitialiser le mot de passe

Étant donné que je possède un compte sur l'application et que j'ai en ma possession un jeton de réinitialisation valide

Quand je requête le point d'entrée de réinitialisation de mot de passe et que je fournis le jeton dans l'URL, que je fournis le nouveau mot de passe dans le corps de la requête

Alors j'obtiens la représentation de mon utilisateur et je peux m'authentifier avec succès avec mon adresse email et mon nouveau mot de passe.

## Prochaine étape

Il nous reste plus qu'à écrire les tests e2e qui retranscriront ces critères d'acceptance et qui vont être exécutables tout au long du développement.

