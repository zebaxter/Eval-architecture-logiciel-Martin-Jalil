const RankingRepository = require('../application/port/rankingRepository');

/**
 * Adaptateur : stockage du classement en mémoire.
 */
class InMemoryRankingRepository extends RankingRepository {
  constructor() {
    super();
    this.ranking = [];
  }

  async get() {
    return [...this.ranking];
  }

  async save(ranking) {
    this.ranking = [...ranking];
  }
}

module.exports = InMemoryRankingRepository;
