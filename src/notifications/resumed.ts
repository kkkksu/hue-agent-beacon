import { restoreWaitingNotification } from "../commands/restore-waiting-notification";

export async function notifyResumed(): Promise<void> {
  await restoreWaitingNotification("resumed");
}
