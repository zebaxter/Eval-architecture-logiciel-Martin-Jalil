const TeamRepository = require('../application/port/teamRepository');

/**
 * Adaptateur : stockage des équipes en mémoire.
 */
class InMemoryTeamRepository extends TeamRepository {
  /**
   * @param {Array} teams données initiales
   */
  constructor(teams = []) {
    super();
    this.teams = [...teams];
  }

  async findAll() {
    return [...this.teams];
  }

  async findById(id) {
    return this.teams.find((team) => team.id === id) ?? null;
  }
}

module.exports = InMemoryTeamRepository;
