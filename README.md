# Nom prenom et identifiant github
Jalil mzili --> Jalil3004
Martin Mixte --> zebaxter

# Contraintes choisies et architecture

Contraintes **C (indépendance technologique)** et **D (diversification des interfaces)**, traitées avec une Clean Architecture. Schéma et justification : [docs/architecture.md](docs/architecture.md).

# Arena Tournament

API REST de gestion d'un tournoi de jeux vidéo : consultation des équipes et des matchs, création de matchs, enregistrement des résultats et consultation du classement. L'application gère un seul tournoi, sans interface graphique ni authentification.

Six équipes sont disponibles au démarrage : Shadow Wolves, Pixel Warriors, Cyber Phoenix, Dark Knights, Neon Titans et Ghost Squad. Trois matchs sont terminés et trois attendent leur résultat. Les données sont conservées en mémoire et réinitialisées à chaque redémarrage.

## Prérequis

- Node.js 22 ou version ultérieure et npm.
- Facultatif : l'extension REST Client de VS Code pour exécuter `requests.http`.

## Installation et démarrage

Depuis le dossier du projet :

```bash
npm install
npm start
```

Le serveur écoute sur `http://localhost:3000`. Utiliser `Ctrl+C` pour l'arrêter.

## Routes

Les corps des requêtes POST utilisent `Content-Type: application/json`. Les identifiants et scores sont des nombres entiers JSON, sans guillemets.

| Méthode | Route | Description | Succès |
| --- | --- | --- | --- |
| GET | `/teams` | Liste des équipes | 200 |
| GET | `/matches` | Liste des matchs | 200 |
| POST | `/matches` | Crée un match entre deux équipes existantes et distinctes | 201 |
| POST | `/matches/:id/result` | Enregistre le résultat final d'un match en attente | 200 |
| GET | `/ranking` | Retourne le classement conservé en mémoire | 200 |

### Consulter les équipes

```http
GET http://localhost:3000/teams
```

Réponse `200` :

```json
[
  {"id": 1, "name": "Shadow Wolves"},
  {"id": 2, "name": "Pixel Warriors"},
  {"id": 3, "name": "Cyber Phoenix"},
  {"id": 4, "name": "Dark Knights"},
  {"id": 5, "name": "Neon Titans"},
  {"id": 6, "name": "Ghost Squad"}
]
```

### Consulter les matchs

```http
GET http://localhost:3000/matches
```

Réponse `200` : tableau des matchs. Chaque élément possède cette forme (exemple du match 4 au démarrage) :

```json
{"id": 4, "team1Id": 1, "team2Id": 3, "scoreTeam1": null, "scoreTeam2": null, "status": "pending"}
```

### Créer un match

```http
POST http://localhost:3000/matches
Content-Type: application/json

{"team1Id": 1, "team2Id": 6}
```

Réponse `201` pour le premier match créé après démarrage :

```json
{"id": 7, "team1Id": 1, "team2Id": 6, "scoreTeam1": null, "scoreTeam2": null, "status": "pending"}
```

### Enregistrer un résultat

```http
POST http://localhost:3000/matches/4/result
Content-Type: application/json

{"scoreTeam1": 3, "scoreTeam2": 1}
```

Réponse `200` après environ trois secondes :

```json
{"id": 4, "team1Id": 1, "team2Id": 3, "scoreTeam1": 3, "scoreTeam2": 1, "status": "completed"}
```

Le traitement suit ces trois étapes :

1. Les scores sont enregistrés et le match passe à `completed`.
2. Le classement est recalculé à partir de tous les matchs terminés, puis conservé en mémoire.
3. Une notification asynchrone attend trois secondes, puis affiche dans la console un message destiné aux deux équipes. La réponse HTTP est envoyée après cette notification.

Les scores doivent être des entiers positifs ou nuls représentables exactement en JavaScript (`0` à `9007199254740991`). Un match terminé ne peut plus recevoir de résultat. Pendant l'attente de notification, son résultat et le classement actualisé sont déjà consultables et un second enregistrement est refusé.

### Consulter le classement

```http
GET http://localhost:3000/ranking
```

Réponse `200` au démarrage :

```json
[
  {"teamId": 6, "played": 1, "wins": 1, "draws": 0, "losses": 0, "points": 3},
  {"teamId": 1, "played": 1, "wins": 1, "draws": 0, "losses": 0, "points": 3},
  {"teamId": 3, "played": 1, "wins": 0, "draws": 1, "losses": 0, "points": 1},
  {"teamId": 4, "played": 1, "wins": 0, "draws": 1, "losses": 0, "points": 1},
  {"teamId": 5, "played": 1, "wins": 0, "draws": 0, "losses": 1, "points": 0},
  {"teamId": 2, "played": 1, "wins": 0, "draws": 0, "losses": 1, "points": 0}
]
```

Chaque victoire rapporte 3 points, un match nul rapporte 1 point et une défaite rapporte 0 point. Seuls les matchs terminés comptent. Toutes les équipes figurent au classement, triées par points décroissants, puis par nom d'équipe dans l'ordre alphabétique en cas d'égalité. `played`, `wins`, `draws` et `losses` comptent respectivement les matchs joués, victoires, nuls et défaites.

### Erreurs

| Code | Situation |
| --- | --- |
| 400 | Identifiants manquants ou de mauvais type, équipes identiques, scores invalides ou JSON mal formé |
| 404 | Équipe, match ou route introuvable |
| 409 | Résultat d'un match déjà terminé |

Exemple :

```http
POST http://localhost:3000/matches/1/result
Content-Type: application/json

{"scoreTeam1": 2, "scoreTeam2": 0}
```

Réponse `409` :

```json
{"error": "Le résultat de ce match a déjà été enregistré."}
```

Le fichier `requests.http` fournit les appels des cinq routes et des cas d'erreur. Ses commentaires indiquent les requêtes à exécuter préalablement et les cas nécessitant des données réinitialisées.
