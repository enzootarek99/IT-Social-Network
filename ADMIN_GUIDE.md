# Guide administrateur NexusIT

Ce guide explique comment utiliser le back-office NexusIT sans toucher au code.

## Accès

1. Ouvrir `/admin/login`
2. Se connecter avec un compte administrateur.
3. Le compte de démonstration est :
   - Email : `admin@example.com`
   - Mot de passe : `admin123`

Le back-office est séparé du site public. La navigation publique disparaît dans `/admin`.

## Tableau de bord

La page `/admin` affiche :

- nombre d'utilisateurs
- posts
- commentaires
- missions freelance
- événements
- conversations
- messages
- notifications
- signalements

Elle permet aussi de modérer rapidement :

- utilisateurs
- posts
- commentaires
- missions
- événements
- conversations
- messages
- notifications
- signalements
- reviews

## Utilisateurs

Dans `/admin`, section Utilisateurs :

- voir les derniers comptes
- changer un rôle simple
- supprimer un utilisateur

Pour gérer les rôles avancés, utiliser `/admin/roles`.

## Rôles & permissions

Page : `/admin/roles`

Rôles disponibles :

- `SUPER_ADMIN` : accès complet
- `CONTENT_MANAGER` : contenu, pages, freelance, événements, notifications
- `MODERATOR` : utilisateurs, posts, commentaires, signalements
- `SUPPORT` : dashboard, notifications, logs

Les permissions sont vérifiées côté serveur. Même si quelqu'un modifie l'interface, il ne peut pas exécuter une action interdite.

## Apparence

Page : `/admin/appearance`

Permet de modifier :

- nom du site
- URL du logo
- couleur principale
- couleur accent
- couleur de fond
- police
- titre SEO
- description SEO

La preview à droite montre le rendu avant/après.

## Pages & contenu statique

Page : `/admin/pages`

Permet de gérer des pages comme :

- À propos
- FAQ
- CGU

L'éditeur fonctionne avec des blocs :

- texte
- image
- bouton
- séparateur

Les blocs peuvent être réordonnés par glisser-déposer. Le panneau de droite sert à modifier le contenu et les propriétés.

## Logs & activité

Page : `/admin/logs`

Chaque action importante peut créer un log :

- changement de rôle
- suppression utilisateur
- suppression contenu
- modification réglages
- modification pages/blocs

Les logs affichent :

- date
- administrateur
- action
- type d'entité
- ID concerné

## Signalements

Les utilisateurs peuvent signaler un post. Les signalements remontent dans `/admin`, section Signalements.

Un administrateur peut ensuite supprimer le signalement ou supprimer le contenu concerné.

## Bonnes pratiques

- Ne donnez le rôle `SUPER_ADMIN` qu'à très peu de personnes.
- Utilisez `MODERATOR` pour les community managers.
- Utilisez `CONTENT_MANAGER` pour les gestionnaires éditoriaux.
- Testez les changements d'apparence avant de les valider.
- Consultez régulièrement les logs en cas de doute.
