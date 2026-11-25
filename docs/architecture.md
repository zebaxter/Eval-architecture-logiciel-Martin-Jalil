# Architecture cible — Clean Architecture

Contraintes traitées : **C — Indépendance technologique** et **D — Diversification des interfaces**.

## 1. Limites de l'architecture actuelle

| Contrainte | Limite constatée dans l'existant |
| --- | --- |
| C | Les règles métier (validation des équipes et des scores, passage à `completed`, calcul des points, tri du classement) sont écrites directement dans les handlers Express de `server.js`. Ils lisent et modifient le tableau en mémoire de `data.js`. Changer de base de données ou de framework web oblige à réécrire le métier. |
| D | Le seul point d'entrée est HTTP et la logique métier vit dans les routes. Ajouter une interface en ligne de commande obligerait à copier cette logique. |

## 2. Schéma des composants

Les flèches pleines indiquent une dépendance (« appelle » ou « utilise »). Les flèches pointillées indiquent qu'un adaptateur **implémente** un port. Toutes les dépendances pointent vers le centre : le domaine ne dépend de rien.

```mermaid
flowchart TB
    subgraph IF["Interfaces (adaptateurs d'entrée)"]
        REST["<b>API REST</b> (Express)<br/>routes + contrôleurs<br/>JSON ↔ use cases, erreurs → codes HTTP"]
        CLI["<b>CLI</b><br/>commandes terminal<br/>arguments ↔ use cases, erreurs → messages"]
    end

    subgraph APP["Application (use cases)"]
        UC1["ListTeams"]
        UC2["ListMatches"]
        UC3["CreateMatch"]
        UC4["RecordMatchResult<br/>1. enregistre le résultat<br/>2. recalcule le classement<br/>3. notifie les équipes"]
        UC5["GetRanking"]
        P1(["«port» TeamRepository"])
        P2(["«port» MatchRepository"])
        P3(["«port» RankingRepository"])
        P4(["«port» Notifier"])
    end

    subgraph DOM["Domaine (règles métier)"]
        TEAM["<b>Team</b>"]
        MATCH["<b>Match</b><br/>équipes distinctes, scores entiers ≥ 0,<br/>résultat enregistrable une seule fois"]
        RANK["<b>RankingCalculator</b><br/>3 pts victoire, 1 pt nul, 0 pt défaite<br/>tri : points ↓ puis nom"]
        ERR["Erreurs métier<br/>Validation / NotFound / Conflict"]
    end

    subgraph INFRA["Infrastructure (adaptateurs de sortie)"]
        MEM1["InMemoryTeamRepository"]
        MEM2["InMemoryMatchRepository"]
        MEM3["InMemoryRankingRepository"]
        NOTIF["ConsoleNotifier"]
        FUT["(demain : PostgresMatchRepository, …)"]
    end

    ROOT["<b>Composition root</b><br/>main REST / main CLI<br/>instancie les adaptateurs et les injecte dans les use cases"]

    REST --> APP
    CLI --> APP
    UC3 & UC4 --> MATCH
    UC4 & UC5 --> RANK
    UC1 & UC3 --> TEAM
    APP --> P1 & P2 & P3 & P4

    MEM1 -.implémente.-> P1
    MEM2 -.implémente.-> P2
    MEM3 -.implémente.-> P3
    NOTIF -.implémente.-> P4
    FUT -.implémente.-> P2

    ROOT --> IF
    ROOT --> INFRA
```

## 3. Responsabilités

| Couche | Composant | Responsabilité | Dépend de |
| --- | --- | --- | --- |
| Domaine | `Team`, `Match` | Entités et invariants métier (équipes distinctes, scores valides, un match terminé ne change plus) | rien |
| Domaine | `RankingCalculator` | Calcule le classement à partir des équipes et des matchs terminés | rien |
| Domaine | Erreurs métier | `ValidationError`, `NotFoundError`, `ConflictError`, sans aucune notion de code HTTP | rien |
| Application | Use cases | Orchestrent un scénario métier en utilisant les ports | Domaine, ports |
| Application | Ports | Interfaces vers l'extérieur : `TeamRepository`, `MatchRepository`, `RankingRepository`, `Notifier` | Domaine |
| Infrastructure | Repositories en mémoire, `ConsoleNotifier` | Implémentent les ports. Seule cette partie change si l'on passe à une autre persistance (**C**) | Ports |
| Interfaces | API REST (Express) | Traduit HTTP ↔ use cases. Seule cette partie change si l'on change de framework web (**C**) | Use cases |
| Interfaces | CLI | Second point d'entrée qui appelle les **mêmes** use cases, sans dupliquer le métier (**D**) | Use cases |
| Composition root | `main` REST / `main` CLI | Assemble les adaptateurs et les use cases (injection de dépendances) | Toutes les couches |

## 4. Interaction : enregistrer un résultat (REST ou CLI)

```mermaid
sequenceDiagram
    actor U as Organisateur
    participant I as REST ou CLI
    participant UC as RecordMatchResult
    participant M as Match (domaine)
    participant MR as MatchRepository
    participant RC as RankingCalculator
    participant RR as RankingRepository
    participant N as Notifier

    U->>I: POST /matches/4/result ou "arena result 4 3 1"
    I->>UC: execute({matchId: 4, scoreTeam1: 3, scoreTeam2: 1})
    UC->>MR: findById(4)
    UC->>M: recordResult(3, 1)
    Note right of M: lève ValidationError ou ConflictError si besoin
    UC->>MR: save(match)
    UC->>RC: compute(teams, matches)
    UC->>RR: save(ranking)
    UC->>N: notifyTeams(match)
    UC-->>I: match
    I-->>U: 200 JSON ou affichage terminal
```

## 5. Comment le schéma répond aux contraintes

- **C** : le domaine et les use cases ne connaissent ni Express ni le stockage. Changer de persistance revient à écrire un nouvel adaptateur qui implémente un port et à modifier une ligne dans le composition root. Changer de framework web ne touche que l'adaptateur REST.
- **D** : REST et CLI sont deux adaptateurs d'entrée indépendants qui appellent les mêmes use cases. Chacun peut évoluer seul et les règles métier n'existent qu'à un seul endroit.
