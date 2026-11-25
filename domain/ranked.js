function recalculateRanking(teams,matches) {
  const standings = teams.map((team) => ({
    teamId: team.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
  }));

  for (const match of matches) {
    if (match.status !== 'completed') continue;
    const team1 = standings.find((entry) => entry.teamId === match.team1Id);
    const team2 = standings.find((entry) => entry.teamId === match.team2Id);
    team1.played += 1;
    team2.played += 1;

    if (match.scoreTeam1 === match.scoreTeam2) {
      team1.draws += 1;
      team2.draws += 1;
      team1.points += 1;
      team2.points += 1;
    } else {
      const winner = match.scoreTeam1 > match.scoreTeam2 ? team1 : team2;
      const loser = winner === team1 ? team2 : team1;
      winner.wins += 1;
      winner.points += 3;
      loser.losses += 1;
    }
  }

  standings.sort((first, second) => {
    const firstName = teams.find((team) => team.id === first.teamId).name;
    const secondName = teams.find((team) => team.id === second.teamId).name;
    return second.points - first.points || firstName.localeCompare(secondName, 'fr');
  });
  return standings;
}
module.exports = { recalculateRanking };