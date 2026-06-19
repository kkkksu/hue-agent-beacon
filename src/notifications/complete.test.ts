import { describe, expect, mock, test } from "bun:test";
import { notifyComplete, type CompleteDeps } from "./complete";

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

function createDeps(overrides: Partial<CompleteDeps> = {}): CompleteDeps {
  return {
    readConfig: mock(async () => config),
    getLight: mock(async () => previousLight),
    setLight: mock(async () => {}),
    sleep: mock(async () => {}),
    log: mock(() => {}),
    ...overrides,
  };
}

describe("notifyComplete", () => {
  test("flashes green, waits, restores previous state, and logs success", async () => {
    const deps = createDeps();

    await notifyComplete(deps);

    expect(deps.getLight).toHaveBeenCalledWith(config);
    expect(deps.setLight).toHaveBeenNthCalledWith(1, config, {
      on: { on: true },
      dimming: { brightness: 100 },
      color: { xy: { x: 0.17, y: 0.7 } },
    });
    expect(deps.sleep).toHaveBeenCalledWith(1_000);
    expect(deps.setLight).toHaveBeenNthCalledWith(2, config, {
      on: { on: true },
      dimming: { brightness: 33 },
      color: { xy: { x: 0.31, y: 0.32 } },
    });
    expect(deps.log).toHaveBeenCalledWith("✅ Complete notification sent");
  });
});
