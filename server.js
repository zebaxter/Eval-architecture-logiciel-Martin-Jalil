const express = require('express');
const data = require('./data');
const Match = require('./domain/match');
const { recalculateRanking } = require('./domain/ranked');
const InMemoryTeamRepository = require('./infrastructure/inMemoryTeamRepository');
const InMemoryMatchRepository = require('./infrastructure/inMemoryMatchRepository');
const InMemoryRankingRepository = require('./infrastructure/inMemoryRankingRepository');
const ConsoleNotifier = require('./infrastructure/consoleNotifier');
const { ValidationError, NotFoundError, ConflictError } = require('./domain/errors');


const app = express();
app.use(express.json());
data.matches = data.matches.map((entry) => new Match(entry));

async function notifyTeams(match) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const team1 = data.teams.find((team) => team.id === match.team1Id);
  const team2 = data.teams.find((team) => team.id === match.team2Id);
  console.log(
    `Notification à ${team1.name} et ${team2.name} : match ${match.id} terminé, ` +
    `score ${match.scoreTeam1} - ${match.scoreTeam2}.`,
  );
}

app.get('/teams', async (req, res) => {
  res.json(await listTeams.execute());
});

app.get('/matches', (req, res) => {
  res.json(data.matches);
});

app.post('/matches', (req, res) => {
  const { team1Id, team2Id } = req.body || {};
  if (!Number.isSafeInteger(team1Id) || !Number.isSafeInteger(team2Id)) {
    return res.status(400).json({ error: 'Les identifiants des équipes doivent être des entiers.' });
  }
  const team1 = data.teams.find((team) => team.id === team1Id);
  const team2 = data.teams.find((team) => team.id === team2Id);
  if (!team1 || !team2) {
    return res.status(404).json({ error: 'Une des équipes est introuvable.' });
  }
  const match = Match.create(
    Math.max(0, ...data.matches.map((entry) => entry.id)) + 1,
    team1Id,
    team2Id,
  );
  data.matches.push(match);
  res.status(201).json(match);
});

app.post('/matches/:id/result', async (req, res) => {
  const match = data.matches.find((entry) => String(entry.id) === req.params.id);
  if (!match) {
    return res.status(404).json({ error: 'Match introuvable.' });
  }
  if (match.status === 'completed') {
    return res.status(409).json({ error: 'Le résultat de ce match a déjà été enregistré.' });
  }

  const { scoreTeam1, scoreTeam2 } = req.body || {};
  if (!Number.isSafeInteger(scoreTeam1) || scoreTeam1 < 0 ||
      !Number.isSafeInteger(scoreTeam2) || scoreTeam2 < 0) {
    return res.status(400).json({ error: 'Les scores doivent être des entiers positifs ou nuls.' });
  }

  match.scoreTeam1 = scoreTeam1;
  match.scoreTeam2 = scoreTeam2;
  match.status = 'completed';
  data.ranking = recalculateRanking(data.teams, data.matches);
  await notifyTeams(match);
  res.json(match);
});

app.get('/ranking', (req, res) => {
  res.json(data.ranking);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Le corps de la requête doit être un JSON valide.' });
  }
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
  if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

data.ranking = recalculateRanking(data.teams, data.matches);
app.listen(3000, () => {
  console.log('Arena Tournament disponible sur http://localhost:3000');
});
