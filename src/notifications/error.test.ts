import { describe, expect, mock, test } from "bun:test";
import { notifyError, type ErrorDeps } from "./error";

const config = {
  bridgeIp: "192.168.1.2",
  applicationKey: "key",
  lightId: "light-1",
};

const previousLight = {
  on: { on: true },
  dimming: { brightness: 33 },
  color: { xy: { x: 0.31, y: 0.32 } },
};

function createDeps(overrides: Partial<ErrorDeps> = {}): ErrorDeps {
  return {
    readConfig: mock(async () => config),
    getLight: mock(async () => previousLight),
    setLight: mock(async () => {}),
    sleep: mock(async () => {}),
    log: mock(() => {}),
    ...overrides,
  };
}

describe("notifyError", () => {
  test("flashes red with breathe alert, waits, restores previous state, and logs success", async () => {
    const deps = createDeps();

    await notifyError(deps);

    expect(deps.getLight).toHaveBeenCalledWith(config);
    expect(deps.setLight).toHaveBeenNthCalledWith(1, config, {
      on: { on: true },
      dimming: { brightness: 100 },
      color: { xy: { x: 0.7, y: 0.3 } },
      alert: { action: "breathe" },
    });
    expect(deps.sleep).toHaveBeenCalledWith(1_500);
    expect(deps.setLight).toHaveBeenNthCalledWith(2, config, {
      on: { on: true },
      dimming: { brightness: 33 },
      color: { xy: { x: 0.31, y: 0.32 } },
    });
    expect(deps.log).toHaveBeenCalledWith("✅ Error notification sent");
  });

  test("falls back to static red if breathe alert fails", async () => {
    let callCount = 0;
    const deps = createDeps({
      setLight: mock(async () => {
        callCount += 1;
        if (callCount === 1) throw new Error("breathe unsupported");
      }) as ErrorDeps["setLight"],
    });

    await notifyError(deps);

    expect(deps.setLight).toHaveBeenNthCalledWith(1, config, {
      on: { on: true },
      dimming: { brightness: 100 },
      color: { xy: { x: 0.7, y: 0.3 } },
      alert: { action: "breathe" },
    });
    expect(deps.setLight).toHaveBeenNthCalledWith(2, config, {
      on: { on: true },
      dimming: { brightness: 100 },
      color: { xy: { x: 0.7, y: 0.3 } },
    });
    expect(deps.setLight).toHaveBeenNthCalledWith(3, config, {
      on: { on: true },
      dimming: { brightness: 33 },
      color: { xy: { x: 0.31, y: 0.32 } },
    });
  });
});
