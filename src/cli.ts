#!/usr/bin/env bun

import { ack } from "./commands/ack";
import { notifyComplete } from "./notifications/complete";
import { notifyError } from "./notifications/error";
import { notifyResumed } from "./notifications/resumed";
import { notifyWaitingForUser } from "./notifications/waiting-for-user";

const notifyHandlers: Record<string, () => Promise<void>> = {
  complete: notifyComplete,
  error: notifyError,
  waiting_for_user: notifyWaitingForUser,
  resumed: notifyResumed,
};

function printUsage(): void {
  const notifyCommands = Object.keys(notifyHandlers).map(
    (event) => `  hue-agent-beacon notify ${event}`,
  );

  console.error(["Usage:", ...notifyCommands, "  hue-agent-beacon ack"].join("\n"));
}

async function main(): Promise<void> {
  const [command, event] = Bun.argv.slice(2);

  if (command === "notify" && event) {
    const notify = notifyHandlers[event];

    if (notify) {
      await notify();
      return;
    }
  }

  if (command === "ack") {
    await ack();
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
