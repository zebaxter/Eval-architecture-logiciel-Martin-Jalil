class TeamRepository {
  /** @returns {Promise<Team[]>} toutes les équipes */
  async findAll() { throw new Error('Not implemented'); }

  /** @returns {Promise<Team|null>} l'équipe, ou null si elle n'existe pas */
  async findById(id) { throw new Error('Not implemented'); }
}

module.exports = TeamRepository;