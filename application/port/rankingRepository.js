class RankingRepository {

  async get() {
    throw new Error('RankingRepository.get() non implémenté');
  }

  async save(ranking) {
    throw new Error('RankingRepository.save() non implémenté');
  }
}

module.exports = RankingRepository;