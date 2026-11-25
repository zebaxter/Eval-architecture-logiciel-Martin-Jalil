const Match = require('../../domain/match');
const { ValidationError, NotFoundError } = require('../../domain/errors');

class CreateMatch {
  constructor({ teamRepository, matchRepository }) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
  }

  async execute({ team1Id, team2Id }) {
    if (!Number.isSafeInteger(team1Id) || !Number.isSafeInteger(team2Id)) {
      throw new ValidationError('Les identifiants des équipes doivent être des entiers.');
    }

    const team1 = await this.teamRepository.findById(team1Id);
    const team2 = await this.teamRepository.findById(team2Id);
    if (!team1 || !team2) {
      throw new NotFoundError('Une des équipes est introuvable.');
    }

    const id = await this.matchRepository.nextId();
    const match = Match.create(id, team1Id, team2Id); 
    await this.matchRepository.save(match);
    return match;
  }
}

module.exports = CreateMatch;
