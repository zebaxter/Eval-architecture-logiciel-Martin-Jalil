class GetRanking {
  constructor({ rankingRepository }) {
    this.rankingRepository = rankingRepository;
  }

  async execute() {
    return this.rankingRepository.get();
  }
}

module.exports = GetRanking;
