import { describe, expect, mock, test } from "bun:test";
import {
  restoreWaitingNotification,
  type RestoreWaitingNotificationDeps,
} from "./restore-waiting-notification";

const config = {
  bridgeIp: "192.168.1.2",
  applicationKey: "key",
  lightId: "light-1",
};

const previousLight = {
  on: { on: true },
  dimming: { brightness: 25 },
  color: { xy: { x: 0.31, y: 0.32 } },
};

function createDeps(overrides: Partial<RestoreWaitingNotificationDeps> = {}): RestoreWaitingNotificationDeps {
  return {
    readConfig: mock(async () => config),
    readState: mock(async () => ({
      activeEvent: "waiting_for_user",
      lightId: "light-1",
      previousLight,
    })),
    setLight: mock(async () => {}),
    clearState: mock(async () => {}),
    log: mock(() => {}),
    ...overrides,
  };
}

describe("restoreWaitingNotification", () => {
  test("logs a resumed no-op when there is no waiting state", async () => {
    const deps = createDeps({ readState: mock(async () => undefined) });

    await restoreWaitingNotification("resumed", deps);

    expect(deps.setLight).not.toHaveBeenCalled();
    expect(deps.clearState).not.toHaveBeenCalled();
    expect(deps.log).toHaveBeenCalledWith("No waiting notification to resume from");
  });

  test("restores the previous light and clears state when resumed", async () => {
    const deps = createDeps();

    await restoreWaitingNotification("resumed", deps);

    expect(deps.setLight).toHaveBeenCalledWith(config, {
      on: { on: true },
      dimming: { brightness: 25 },
      color: { xy: { x: 0.31, y: 0.32 } },
    });
    expect(deps.clearState).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledWith("✅ Agent resumed and light restored");
  });

  test("uses manual ack messaging for ack fallback", async () => {
    const deps = createDeps();

    await restoreWaitingNotification("ack", deps);

    expect(deps.log).toHaveBeenCalledWith("✅ Notification acknowledged and light restored");
  });

  test("throws when saved state belongs to a different light", async () => {
    const deps = createDeps({
      readState: mock(async () => ({
        activeEvent: "waiting_for_user",
        lightId: "other-light",
        previousLight,
      })),
    });

    await expect(restoreWaitingNotification("resumed", deps)).rejects.toThrow(
      "State light other-light does not match config light light-1",
    );
    expect(deps.setLight).not.toHaveBeenCalled();
    expect(deps.clearState).not.toHaveBeenCalled();
  });
});
