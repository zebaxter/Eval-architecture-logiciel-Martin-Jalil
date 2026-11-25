class ListMatches {
  constructor({ matchRepository }) {
    this.matchRepository = matchRepository;
  }

  async execute() {
    return this.matchRepository.findAll();
  }
}

module.exports = ListMatches;
