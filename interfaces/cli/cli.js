const { buildContainer } = require('../../main/container');
const { DomainError } = require('../../domain/errors');

async function main() {
  const useCases = await buildContainer();
  const [command, ...args] = process.argv.slice(2);
  const [a, b, c] = args.map(Number);

  const commands = {
    teams: () => useCases.listTeams.execute(),
    matches: () => useCases.listMatches.execute(),
    'create-match': () => useCases.createMatch.execute({ team1Id: a, team2Id: b }),
    result: () => useCases.recordMatchResult.execute({ matchId: a, scoreTeam1: b, scoreTeam2: c }),
    ranking: () => useCases.getRanking.execute(),
  };

  if (!commands[command]) {
    console.log('Usage : npm run cli -- teams | matches | create-match <team1> <team2> | result <match> <score1> <score2> | ranking');
    process.exitCode = 1;
    return;
  }

  try {
    console.log(JSON.stringify(await commands[command](), null, 2));
  } catch (error) {
    if (!(error instanceof DomainError)) throw error;
    console.error(`Erreur : ${error.message}`);
    process.exitCode = 1;
  }
}

main();
