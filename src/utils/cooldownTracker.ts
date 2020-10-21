import { getBaseLogger } from './logger';

const Logger = getBaseLogger();

class CooldownTracker {

  private cooldownEndMsTimestamp: number;

  constructor(seconds?: number) {
    Logger.silly("[CountdownTracker] Constructor");
    if (seconds) {
      this.setNSeconds(seconds);
    }
  }

  public setNSeconds(n: number): void | Error {
    let msNow = new Date().getTime();
    if (this.cooldownEndMsTimestamp !== undefined && this.cooldownEndMsTimestamp > msNow) {
      return Error("Unable to set cooldown until previous is expired");
    }
    let targetTimestamp = msNow + (1000 * n);
    this.cooldownEndMsTimestamp = targetTimestamp;
    Logger.debug("[CountdownTracker] Setting cooldown end time to " + targetTimestamp);
    return;
  }

  public isExpired(): boolean {
    Logger.debug("[CountdownTracker] Checking if cooldown is expired");
    if (this.cooldownEndMsTimestamp === undefined) {
      return true;
    }
    let msNow = new Date().getTime();
    if (this.cooldownEndMsTimestamp <= msNow) {
      return true;
    }
    return false;
  }
}

export default CooldownTracker;
