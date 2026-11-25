const express = require('express');
const data = require('./data');
const Match = require('./domain/match');
const { recalculateRanking } = require('./domain/ranked');

const app = express();
app.use(express.json());

function recalculateRanking() {
  const standings = data.teams.map((team) => ({
    teamId: team.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
  }));

  for (const match of data.matches) {
    if (match.status !== 'completed') continue;

    const team1 = standings.find((entry) => entry.teamId === match.team1Id);
    const team2 = standings.find((entry) => entry.teamId === match.team2Id);
    team1.played += 1;
    team2.played += 1;

    if (match.scoreTeam1 === match.scoreTeam2) {
      team1.draws += 1;
      team2.draws += 1;
      team1.points += 1;
      team2.points += 1;
    } else {
      const winner = match.scoreTeam1 > match.scoreTeam2 ? team1 : team2;
      const loser = winner === team1 ? team2 : team1;
      winner.wins += 1;
      winner.points += 3;
      loser.losses += 1;
    }
  }

  standings.sort((first, second) => {
    const firstName = data.teams.find((team) => team.id === first.teamId).name;
    const secondName = data.teams.find((team) => team.id === second.teamId).name;
    return second.points - first.points || firstName.localeCompare(secondName, 'fr');
  });
  data.ranking = standings;
}

async function notifyTeams(match) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const team1 = data.teams.find((team) => team.id === match.team1Id);
  const team2 = data.teams.find((team) => team.id === match.team2Id);
  console.log(
    `Notification à ${team1.name} et ${team2.name} : match ${match.id} terminé, ` +
    `score ${match.scoreTeam1} - ${match.scoreTeam2}.`,
  );
}

app.get('/teams', (req, res) => {
  res.json(data.teams);
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
  if (team1Id === team2Id) {
    return res.status(400).json({ error: 'Une équipe ne peut pas jouer contre elle-même.' });
  }

  const match = {
    id: Math.max(0, ...data.matches.map((entry) => entry.id)) + 1,
    team1Id,
    team2Id,
    scoreTeam1: null,
    scoreTeam2: null,
    status: 'pending',
  };
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
  recalculateRanking();
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
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  res.status(status).json({ error: status === 500 ? 'Erreur interne du serveur.' : error.message });
});

recalculateRanking();
app.listen(3000, () => {
  console.log('Arena Tournament disponible sur http://localhost:3000');
});
