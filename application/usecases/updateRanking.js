const { recalculateRanking } = require('../../domain/ranked');

class UpdateRanking {
  constructor({ teamRepository, matchRepository, rankingRepository }) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.rankingRepository = rankingRepository;
  }

  async execute() {
    const teams = await this.teamRepository.findAll();
    const matches = await this.matchRepository.findAll();
    const ranking = recalculateRanking(teams, matches);
    await this.rankingRepository.save(ranking);
    return ranking;
  }
}

module.exports = UpdateRanking;
