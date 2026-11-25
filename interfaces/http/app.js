const express = require('express');
const { ValidationError, NotFoundError, ConflictError } = require('../../domain/errors');

function createHttpApp(useCases) {
  const app = express();
  app.use(express.json());

  app.get('/teams', async (req, res) => {
    res.json(await useCases.listTeams.execute());
  });

  app.get('/matches', async (req, res) => {
    res.json(await useCases.listMatches.execute());
  });

  app.post('/matches', async (req, res) => {
    const { team1Id, team2Id } = req.body || {};
    const match = await useCases.createMatch.execute({ team1Id, team2Id });
    res.status(201).json(match);
  });

  app.post('/matches/:id/result', async (req, res) => {
    const { scoreTeam1, scoreTeam2 } = req.body || {};
    const match = await useCases.recordMatchResult.execute({
      matchId: parseId(req.params.id),
      scoreTeam1,
      scoreTeam2,
    });
    res.json(match);
  });

  app.get('/ranking', async (req, res) => {
    res.json(await useCases.getRanking.execute());
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Route introuvable.' });
  });

  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Le corps de la requête doit être un JSON valide.' });
    }
    const status = statusFor(error);
    if (status === 500) console.error(error);
    res.status(status).json({ error: status === 500 ? 'Erreur interne du serveur.' : error.message });
  });

  return app;
}

function parseId(raw) {
  const id = Number(raw);
  return String(id) === raw ? id : NaN;
}

function statusFor(error) {
  if (error instanceof ValidationError) return 400;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error.status >= 400 && error.status < 500) return error.status;
  return 500;
}

module.exports = { createHttpApp };
