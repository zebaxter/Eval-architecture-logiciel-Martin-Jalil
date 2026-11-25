class ListTeams {
  constructor({ teamRepository }) {
    this.teamRepository = teamRepository;
  }

  async execute() {
    return this.teamRepository.findAll();
  }
}

module.exports = ListTeams;
