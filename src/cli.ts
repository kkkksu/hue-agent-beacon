#!/usr/bin/env bun

import { ack } from "./commands/ack";
import { notifyComplete } from "./notifications/complete";
import { notifyResumed } from "./notifications/resumed";
import { notifyWaitingForUser } from "./notifications/waiting-for-user";

const notifyHandlers: Record<string, () => Promise<void>> = {
  complete: notifyComplete,
  waiting_for_user: notifyWaitingForUser,
  resumed: notifyResumed,
};

function printUsage(): void {
  console.error(`Usage:
  hue-agent-beacon notify complete
  hue-agent-beacon notify waiting_for_user
  hue-agent-beacon notify resumed
  hue-agent-beacon ack`);
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
