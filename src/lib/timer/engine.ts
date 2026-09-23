import { PauseEvent } from "@/types";

export class TimerEngine {
  /**
   * Calculates pure focused seconds up to a given reference time (defaults to now).
   * Total Time = (ReferenceTime - StartedAt) - Sum(PausedIntervals)
   */
  public static calculatePureFocusedSeconds(
    startedAtISO: string,
    pauseEvents: PauseEvent[],
    status: "running" | "paused" | "completed" | "idle" | "abandoned",
    endedAtISO?: string,
    referenceDate = new Date()
  ): number {
    if (!startedAtISO || status === "idle") return 0;

    const startTime = new Date(startedAtISO).getTime();
    const endTime = endedAtISO ? new Date(endedAtISO).getTime() : referenceDate.getTime();

    if (endTime <= startTime) return 0;

    let totalPauseMs = 0;

    for (const p of pauseEvents) {
      const pauseStart = new Date(p.pausedAt).getTime();
      const pauseEnd = p.resumedAt ? new Date(p.resumedAt).getTime() : endTime;

      if (pauseEnd > pauseStart) {
        totalPauseMs += pauseEnd - pauseStart;
      }
    }

    const elapsedMs = endTime - startTime - totalPauseMs;
    return Math.max(0, Math.floor(elapsedMs / 1000));
  }

  /**
   * Returns formatted remaining time given planned duration and pure focused seconds.
   */
  public static calculateRemainingSeconds(plannedMinutes: number, pureFocusedSeconds: number): number {
    const totalPlannedSeconds = plannedMinutes * 60;
    return Math.max(0, totalPlannedSeconds - pureFocusedSeconds);
  }
}
