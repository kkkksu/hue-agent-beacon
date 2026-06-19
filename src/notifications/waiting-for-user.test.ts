import { describe, expect, mock, test } from "bun:test";
import { notifyWaitingForUser, type WaitingForUserDeps } from "./waiting-for-user";

const config = {
  bridgeIp: "192.168.1.2",
  applicationKey: "key",
  lightId: "light-1",
};

const previousLight = {
  on: { on: true },
  dimming: { brightness: 25 },
};

function createDeps(overrides: Partial<WaitingForUserDeps> = {}): WaitingForUserDeps {
  return {
    readConfig: mock(async () => config),
    readState: mock(async () => undefined),
    writeState: mock(async () => {}),
    getLight: mock(async () => previousLight),
    setLight: mock(async () => {}),
    log: mock(() => {}),
    ...overrides,
  };
}

describe("notifyWaitingForUser", () => {
  test("snapshots the current light and sends yellow breathe alert", async () => {
    const deps = createDeps();

    await notifyWaitingForUser(deps);

    expect(deps.getLight).toHaveBeenCalledWith(config);
    expect(deps.writeState).toHaveBeenCalledWith({
      activeEvent: "waiting_for_user",
      lightId: "light-1",
      previousLight,
    });
    expect(deps.setLight).toHaveBeenCalledWith(config, {
      on: { on: true },
      dimming: { brightness: 90 },
      color: { xy: { x: 0.44, y: 0.52 } },
      alert: { action: "breathe" },
    });
  });

  test("does not overwrite the original snapshot for repeated waiting notifications", async () => {
    const deps = createDeps({
      readState: mock(async () => ({
        activeEvent: "waiting_for_user",
        lightId: "light-1",
        previousLight,
      })),
    });

    await notifyWaitingForUser(deps);

    expect(deps.getLight).not.toHaveBeenCalled();
    expect(deps.writeState).not.toHaveBeenCalled();
  });

  test("falls back to static yellow if breathe alert fails", async () => {
    let callCount = 0;
    const deps = createDeps({
      setLight: mock(async () => {
        callCount += 1;
        if (callCount === 1) throw new Error("breathe unsupported");
      }) as WaitingForUserDeps["setLight"],
    });

    await notifyWaitingForUser(deps);

    expect(deps.setLight).toHaveBeenCalledTimes(2);
    expect(deps.setLight).toHaveBeenLastCalledWith(config, {
      on: { on: true },
      dimming: { brightness: 90 },
      color: { xy: { x: 0.44, y: 0.52 } },
    });
  });
});
