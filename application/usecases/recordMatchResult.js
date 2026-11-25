const { NotFoundError } = require('../../domain/errors');

class RecordMatchResult {
  constructor({ teamRepository, matchRepository, updateRanking, notifier }) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.updateRanking = updateRanking;
    this.notifier = notifier;
  }

  async execute({ matchId, scoreTeam1, scoreTeam2 }) {
    const match = Number.isSafeInteger(matchId)
      ? await this.matchRepository.findById(matchId)
      : null;
    if (!match) {
      throw new NotFoundError('Match introuvable.');
    }

    match.recordResult(scoreTeam1, scoreTeam2); // lève ConflictError ou ValidationError
    await this.matchRepository.save(match);

    await this.updateRanking.execute();

    const team1 = await this.teamRepository.findById(match.team1Id);
    const team2 = await this.teamRepository.findById(match.team2Id);
    await this.notifier.notifyMatchCompleted(match, team1, team2);

    return match;
  }
}

module.exports = RecordMatchResult;
