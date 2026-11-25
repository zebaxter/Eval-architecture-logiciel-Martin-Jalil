const MatchRepository = require('../application/port/matchRepository');
const Match = require('../domain/match');

/**
 * Adaptateur : stockage des matchs en mémoire.
 */
class InMemoryMatchRepository extends MatchRepository {
  /**
   * @param {Array} matches données initiales
   */
  constructor(matches = []) {
    super();
    // Les données brutes sont converties en entités du domaine
    this.matches = matches.map((match) => (match instanceof Match ? match : new Match(match)));
  }

  async findAll() {
    return [...this.matches];
  }

  async findById(id) {
    return this.matches.find((match) => match.id === id) ?? null;
  }

  async save(match) {
    const index = this.matches.findIndex((entry) => entry.id === match.id);
    if (index === -1) {
      this.matches.push(match);
    } else {
      this.matches[index] = match;
    }
  }

  async nextId() {
    return Math.max(0, ...this.matches.map((match) => match.id)) + 1;
  }
}

module.exports = InMemoryMatchRepository;
