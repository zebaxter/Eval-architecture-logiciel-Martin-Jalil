const data = require('../data');

const InMemoryTeamRepository = require('../infrastructure/inMemoryTeamRepository');
const InMemoryMatchRepository = require('../infrastructure/inMemoryMatchRepository');
const InMemoryRankingRepository = require('../infrastructure/inMemoryRankingRepository');
const ConsoleNotifier = require('../infrastructure/consoleNotifier');

const ListTeams = require('../application/usecases/listTeams');
const ListMatches = require('../application/usecases/listMatches');
const CreateMatch = require('../application/usecases/createMatch');
const UpdateRanking = require('../application/usecases/updateRanking');
const RecordMatchResult = require('../application/usecases/recordMatchResult');
const GetRanking = require('../application/usecases/getRanking');

async function buildContainer() {
  const teamRepository = new InMemoryTeamRepository(data.teams);
  const matchRepository = new InMemoryMatchRepository(data.matches);
  const rankingRepository = new InMemoryRankingRepository();
  const notifier = new ConsoleNotifier();

  const updateRanking = new UpdateRanking({ teamRepository, matchRepository, rankingRepository });

  const useCases = {
    listTeams: new ListTeams({ teamRepository }),
    listMatches: new ListMatches({ matchRepository }),
    createMatch: new CreateMatch({ teamRepository, matchRepository }),
    recordMatchResult: new RecordMatchResult({
      teamRepository,
      matchRepository,
      updateRanking,
      notifier,
    }),
    getRanking: new GetRanking({ rankingRepository }),
  };

  await updateRanking.execute();

  return useCases;
}

module.exports = { buildContainer };
