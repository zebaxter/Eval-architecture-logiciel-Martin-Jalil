class Match {
  constructor({ id, team1Id, team2Id, scoreTeam1 = null, scoreTeam2 = null, status = 'pending' }) {
    this.id = id;
    this.team1Id = team1Id;
    this.team2Id = team2Id;
    this.scoreTeam1 = scoreTeam1;
    this.scoreTeam2 = scoreTeam2;
    this.status = status;
  }

  static create(id, team1Id, team2Id) {
    if (team1Id === team2Id) {
      throw new Error('Une équipe ne peut pas jouer contre elle-même.');
    }
    return new Match({ id, team1Id, team2Id });
  }

  recordResult(scoreTeam1, scoreTeam2) {
    if (this.status === 'completed') {
      throw new Error('Le résultat de ce match a déjà été enregistré.');
    }
    if (!Number.isSafeInteger(scoreTeam1) || scoreTeam1 < 0 ||
        !Number.isSafeInteger(scoreTeam2) || scoreTeam2 < 0) {
      throw new Error('Les scores doivent être des entiers positifs ou nuls.');
    }
    this.scoreTeam1 = scoreTeam1;
    this.scoreTeam2 = scoreTeam2;
    this.status = 'completed';
  }
}

module.exports = Match;