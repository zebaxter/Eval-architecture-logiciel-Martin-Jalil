
class MatchRepository {
    
  async findAll() {
    throw new Error('MatchRepository.findAll() non implémenté');
  }

  async findById(id) {
    throw new Error('MatchRepository.findById() non implémenté');
  }

  async save(match) {
    throw new Error('MatchRepository.save() non implémenté');
  }

  async nextId() {
    throw new Error('MatchRepository.nextId() non implémenté');
  }
}

module.exports = MatchRepository;