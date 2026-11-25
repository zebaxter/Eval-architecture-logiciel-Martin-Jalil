const Notifier = require('../application/port/notifier');

/**
 * Adaptateur : notification simulée dans la console.
 * L'attente reproduit la lenteur du service de notification existant (3 s).
 */
class ConsoleNotifier extends Notifier {
  /**
   * @param {number} delayMs durée simulée de l'envoi
   */
  constructor(delayMs = 3000) {
    super();
    this.delayMs = delayMs;
  }

  async notifyMatchCompleted(match, team1, team2) {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    console.log(
      `Notification à ${team1.name} et ${team2.name} : match ${match.id} terminé, ` +
      `score ${match.scoreTeam1} - ${match.scoreTeam2}.`,
    );
  }
}

module.exports = ConsoleNotifier;
